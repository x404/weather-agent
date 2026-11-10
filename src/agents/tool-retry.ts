import { setTimeout as delay } from "node:timers/promises";
import { AgentToolError } from "./tool-error";

type ToolRetryOptions = {
    idempotent: boolean;
    signal?: AbortSignal;
    onAttempt?: () => void;
};

export async function executeToolWithRetry<T>(
    execute: (signal?: AbortSignal) => Promise<T>,
    options: ToolRetryOptions,
): Promise<T> {
    const { idempotent, signal, onAttempt } = options;
    const maxAttempts = 3;
    let attempts = 0;

    while (true) {
        signal?.throwIfAborted();

        attempts += 1;
        onAttempt?.();

        try {
            const result = await execute(signal);

            signal?.throwIfAborted();

            return result;
        } catch (error) {
            if (signal?.aborted) {
                throw error;
            }

            const canRetry =
                idempotent &&
                error instanceof AgentToolError &&
                error.retryable &&
                attempts < maxAttempts;

            if (!canRetry) {
                throw error;
            }

            await delay(100, undefined, { signal });
        }
    }
}