import OpenAI, {
    APIUserAbortError,
    AuthenticationError,
    PermissionDeniedError,
} from "openai";

const BASE_URL = "https://openrouter.ai/api/v1";

function numberEnv(name: string, fallback: number): number {
    const raw = process.env[name]?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

const apiKey =
    process.env.OPENROUTER_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();

if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set (check your .env)");
}

export const client = new OpenAI({
    apiKey,
    baseURL: BASE_URL,
    timeout: numberEnv("OPENROUTER_TIMEOUT_MS", 30_000),
    maxRetries: 2,
    defaultHeaders: { "X-Title": "weather-agent" },
});

export const MODEL = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";
export const FALLBACK_MODEL =
    process.env.OPENROUTER_FALLBACK_MODEL?.trim() || MODEL;
export const MAX_OUTPUT_TOKENS = numberEnv("OPENROUTER_MAX_OUTPUT_TOKENS", 1600);

const EFFORTS = [
    "none",
    "minimal",
    "low",
    "medium",
    "high",
    "xhigh",
    "max",
] as const;

type Effort = (typeof EFFORTS)[number];

const REASONING_EFFORT = (() => {
    const raw = process.env.OPENROUTER_REASONING_EFFORT?.trim() as
        | Effort
        | undefined;
    return raw && EFFORTS.includes(raw) ? raw : undefined;
})();

export type ModelInput = OpenAI.Responses.ResponseInput;
export type ModelTools = OpenAI.Responses.Tool[];

/** One model call: no agent loop, no tool execution. */
export async function callModel(
    input: ModelInput,
    options: { tools?: ModelTools; model?: string } = {},
): Promise<OpenAI.Responses.Response> {
    const model = options.model ?? MODEL;

    const request: OpenAI.Responses.ResponseCreateParams = {
        model,
        input,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        ...(REASONING_EFFORT ? { reasoning: { effort: REASONING_EFFORT } } : {}),
        ...(options.tools?.length ? { tools: options.tools } : {}),
    };

    try {
        return await client.responses.create(request);
    } catch (error) {
        if (FALLBACK_MODEL === model || !isFallbackWorthy(error)) throw error;

        console.warn(`Model "${model}" failed, falling back to "${FALLBACK_MODEL}"`);
        return await client.responses.create({ ...request, model: FALLBACK_MODEL });
    }
}

function isFallbackWorthy(error: unknown): boolean {
    if (error instanceof APIUserAbortError) return false;
    if (error instanceof AuthenticationError) return false;
    if (error instanceof PermissionDeniedError) return false;
    return true;
}

export type ToolCall = {
    callId: string;
    name: string;
    args: Record<string, unknown>;
};

/** Extracts function calls from a model response and parses their arguments. */
export function getToolCalls(response: OpenAI.Responses.Response): ToolCall[] {
    return response.output
        .filter(
            (item): item is OpenAI.Responses.ResponseFunctionToolCall =>
                item.type === "function_call",
        )
        .map((item) => ({
            callId: item.call_id,
            name: item.name,
            args: safeParse(item.arguments),
        }));
}

function safeParse(raw: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}
