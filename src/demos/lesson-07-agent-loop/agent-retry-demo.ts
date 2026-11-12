import type { OpenAI } from "openai";
import { runAgent } from "../../agents/weather-agent";
import assert from "node:assert/strict";
import { AgentToolError } from "../../agents/tool-error";
import { setTimeout as delay } from "node:timers/promises";

let modelCallCount = 0;

async function generateResponse(
        input: OpenAI.Responses.ResponseInput,
    ): Promise<OpenAI.Responses.Response> {

    modelCallCount += 1;

    if (modelCallCount === 2) {
        const outputs = input.filter(
            (item) => item.type === "function_call_output",
        );

        assert.equal(outputs.length, 1);

        const [output] = outputs;
        assert.equal(output.call_id, "call_1");
        assert.equal(typeof output.output, "string");
        assert.match(String(output.output), /"chunkId":"cloud-cover"/);

        console.log("PASS: the glossary result reached the next model call.");
    }

    const response: OpenAI.Responses.Response = {
        id: `response_${modelCallCount}`,
        object: "response",
        created_at: 0,
        status: "completed",
        model: "demo",
        access_programs: null,
        error: null,
        incomplete_details: null,
        instructions: null,
        metadata: null,
        parallel_tool_calls: false,
        temperature: null,
        top_p: null,
        tool_choice: "auto",
        tools: [],
        output_text: "",
        usage: {
            input_tokens: 10,
            output_tokens: 5,
            total_tokens: 15,
            input_tokens_details: {
                cached_tokens: 0,
                cache_write_tokens: 0,
            },
            output_tokens_details: {
                reasoning_tokens: 0,
            },
        },
        output: [
            {
                type: "function_call",
                id: `tool_${modelCallCount}`,
                call_id: `call_${modelCallCount}`,
                name: "search_weather_glossary",
                arguments: JSON.stringify({
                    question: "What does partly cloudy mean?",
                }),
                status: "completed",
            },
        ],
    };

    if (modelCallCount === 2) {
        response.output_text =
            "Partly cloudy means the sky contains both clouds and clear areas [C1].";

        response.output = [
            {
                type: "message",
                id: "message_final",
                role: "assistant",
                status: "completed",
                content: [
                    {
                        type: "output_text",
                        text: response.output_text,
                        annotations: [],
                    },
                ],
            },
        ];
    }

    return response;
}

async function main(): Promise<void> {
    let searchAttempts = 0;

    const result = await runAgent("What does partly cloudy mean?", {
        generateResponse,
        searchGlossary: async () => {
            searchAttempts += 1;

            if (searchAttempts === 1) {
                throw new AgentToolError(
                    "EMBEDDING_TEMPORARILY_UNAVAILABLE",
                    "The embedding service is temporarily unavailable.",
                    true,
                );
            }

            return [{
                label: "[C1]",
                chunkId: "cloud-cover",
                source: "weather-glossary",
                text: "Partly cloudy means the sky contains both clouds and clear areas.",
                score: 1,
            }];
        },
        onTrace: (event) => {
            console.log("Trace:", JSON.stringify(event, null, 2));
        },
    });

    assert.equal(result.stopReason, "task_completed");
    assert.equal(result.metrics.modelCallCount, 2);
    assert.equal(result.metrics.toolCallCount, 1);
    assert.equal(result.metrics.toolExecutionAttemptCount, 2);
    assert.equal(searchAttempts, 2);

    console.log("PASS: the agent retried the glossary search.");

    modelCallCount = 0;
    
    const controller = new AbortController();

    const cancelled = await runAgent("What does partly cloudy mean?", {
        generateResponse,
        signal: controller.signal,
        searchGlossary: async (_question, attemptSignal) => {
            assert.equal(attemptSignal, controller.signal);

            queueMicrotask(() => controller.abort());
            await delay(100, undefined, { signal: attemptSignal });

            return [];
        },
    });

    assert.equal(cancelled.stopReason, "cancelled");
    assert.equal(cancelled.metrics.modelCallCount, 1);
    assert.equal(cancelled.metrics.toolCallCount, 1);
    assert.equal(cancelled.metrics.toolExecutionAttemptCount, 1);

    console.log("PASS: cancellation interrupted the active glossary search.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});