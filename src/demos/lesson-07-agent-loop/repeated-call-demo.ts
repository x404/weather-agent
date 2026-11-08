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
        verbose: true,
    });

    console.log("Answer:", result.answer);
    console.log("Stop reason:", result.stopReason);
    console.log("Model calls:", modelCallCount);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});