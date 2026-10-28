import type { OpenAI } from "openai";
import { callModel, getToolCalls } from "./model";
import { executeTool, tools } from "./tools";

const SYSTEM_PROMPT = `You are a weather assistant.

Rules:
- Always call geocode first to resolve a city name into coordinates.
- Then call get_weather with exactly those coordinates.
- Never invent coordinates, temperatures, or weather conditions.
- If a tool returns an error, explain it to the user instead of retrying blindly.
- Answer in the same language the user writes in.
- Keep the final answer short: temperature and conditions.`;

export type RunAgentOptions = {
    /** Maximum number of model calls before giving up. */
    maxSteps?: number;
    /** Log each tool call and its result. */
    verbose?: boolean;
    /** Override the model from env. */
    model?: string;
};

/**
 * Runs the agent loop for a single user question:
 * model -> tool calls -> tool results -> model -> ... -> final text.
 */
export async function runAgent(
    question: string,
    options: RunAgentOptions = {},
): Promise<string> {
    const { maxSteps = 6, verbose = false, model } = options;

    const input: OpenAI.Responses.ResponseInput = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
    ];

    for (let step = 1; step <= maxSteps; step++) {
        const response = await callModel(input, { tools, model });
        const calls = getToolCalls(response);

        if (calls.length === 0) {
            return response.output_text.trim();
        }

        // Put the model's own output (assistant message, function calls,
        // reasoning) back into the conversation before the tool results.
        for (const item of response.output) {
            if (
                item.type === "message" ||
                item.type === "function_call" ||
                item.type === "reasoning"
            ) {
                input.push(item);
            }
        }

        for (const call of calls) {
            if (verbose) {
                console.log(`[step ${step}] ${call.name}(${JSON.stringify(call.args)})`);
            }

            let result: unknown;
            try {
                result = await executeTool(call.name, call.args);
            } catch (error) {
                // Let the model see the failure instead of crashing the run.
                result = {
                    error: error instanceof Error ? error.message : String(error),
                };
            }

            if (verbose) {
                console.log(`[step ${step}] result:`, result);
            }

            input.push({
                type: "function_call_output",
                call_id: call.callId,
                output: JSON.stringify(result),
            });
        }
    }

    throw new Error(`Agent did not produce a final answer within ${maxSteps} steps`);
}
