import type { OpenAI } from "openai";
import { runAgent } from "../../agents/weather-agent";

let modelCallCount = 0;

async function generateResponse(): Promise<OpenAI.Responses.Response> {
    modelCallCount += 1;

    return {
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
                arguments: JSON.stringify({ city: "Kyiv" }),
                status: "completed",
            },
        ],
    };
}

async function main(): Promise<void> {
    const result = await runAgent("Check repeated tool calls.", {
        generateResponse,
        verbose: false,
        onTrace: (event) => {
            console.log("Trace:", JSON.stringify(event, null, 2));
        },
    });

    console.log("Answer:", result.answer);
    console.log("Stop reason:", result.stopReason);
    console.log("Model calls:", modelCallCount);
    console.log("Metrics:", result.metrics);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});