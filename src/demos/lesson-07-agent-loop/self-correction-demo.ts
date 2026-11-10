import type { OpenAI } from "openai";
import { runAgent } from "../../agents/weather-agent";
import assert from "node:assert/strict";

let modelCallCount = 0;

async function generateResponse(
        input: OpenAI.Responses.ResponseInput,
    ): Promise<OpenAI.Responses.Response> {

    modelCallCount += 1;

    if (modelCallCount === 2) {
        const errorWasReturned = input.some(
            (item) =>
                item.type === "function_call_output" &&
                item.call_id === "call_1" &&
                typeof item.output === "string" &&
                item.output.includes(
                    "Argument city must be a non-empty string",
                ),
        );

        assert.ok(
            errorWasReturned,
            "The validation error must be included in the next model input.",
        );

        console.log("PASS: validation error reached the next model call.");
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
                name: "geocode",
                arguments: JSON.stringify({
                    city: modelCallCount === 1 ? "" : "Kyiv",
                }),
                status: "completed",
            },
        ],
    };

    if (modelCallCount === 3) {
        response.output_text =
            "The sample coordinates for Kyiv are 50.4501, 30.5234.";

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
    const result = await runAgent("Check argument correction.", {
        generateResponse,
        verbose: false,
        onTrace: (event) => {
            console.log("Trace:", JSON.stringify(event, null, 2));
        },
    });

    assert.equal(result.stopReason, "task_completed");
    assert.equal(result.metrics.modelCallCount, 3);
    assert.equal(result.metrics.toolCallCount, 2);
    assert.equal(result.metrics.toolExecutionAttemptCount, 1);

    console.log("Answer:", result.answer);
    console.log("Stop reason:", result.stopReason);
    console.log("Model calls:", modelCallCount);
    console.log("Metrics:", result.metrics);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});