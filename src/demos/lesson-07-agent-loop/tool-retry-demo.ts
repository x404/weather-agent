import assert from "node:assert/strict";
import { AgentToolError } from "../../agents/tool-error";
import { executeToolWithRetry } from "../../agents/tool-retry";

async function main(): Promise<void> {
    let attempts = 0;

    const result = await executeToolWithRetry(
        async () => {
            if (attempts < 3) {
                throw new AgentToolError(
                    "SERVICE_UNAVAILABLE",
                    "The weather service is temporarily unavailable.",
                    true,
                );
            }

            return {
                temperature: 15,
                description: "Rainy",
            };
        },
        {
            idempotent: true,
            onAttempt: () => {
                attempts += 1;
                console.log("Attempt:", attempts);
            },
        },
    );

    assert.equal(attempts, 3);
    assert.deepEqual(result, {
        temperature: 15,
        description: "Rainy",
    });

    console.log("Result:", result);
    console.log("PASS: the operation succeeded on the third attempt.");

    const cases = [
        {
            name: "stops after three transient failures",
            idempotent: true,
            retryable: true,
            expectedAttempts: 3,
        },
        {
            name: "does not retry a non-idempotent operation",
            idempotent: false,
            retryable: true,
            expectedAttempts: 1,
        },
        {
            name: "does not retry a permanent error",
            idempotent: true,
            retryable: false,
            expectedAttempts: 1,
        },
    ];

    for (const testCase of cases) {
        let executionCount = 0;

        const failure = new AgentToolError(
            "DEMO_FAILURE",
            "The operation failed.",
            testCase.retryable,
        );

        await assert.rejects(
            () =>
                executeToolWithRetry(
                    async () => {
                        executionCount += 1;
                        throw failure;
                    },
                    { idempotent: testCase.idempotent },
                ),
            (error: unknown) => error === failure,
        );

        assert.equal(executionCount, testCase.expectedAttempts);

        console.log(`PASS: ${testCase.name}`);
    }

    const isAbortError = (error: unknown): boolean =>
    error instanceof Error && error.name === "AbortError";

    // Cancellation before the first attempt.
    const cancelledBeforeStart = new AbortController();
    cancelledBeforeStart.abort();

    let startedAttempts = 0;

    await assert.rejects(
        () =>
            executeToolWithRetry(
                async () => {
                    startedAttempts += 1;
                    return "Unexpected execution";
                },
                {
                    idempotent: true,
                    signal: cancelledBeforeStart.signal,
                },
            ),
        isAbortError,
    );

    assert.equal(startedAttempts, 0);
    console.log("PASS: cancellation prevents the first attempt.");

    // Cancellation during the retry delay.
    const cancelledDuringDelay = new AbortController();
    let delayedAttempts = 0;

    await assert.rejects(
        () =>
            executeToolWithRetry(
                async () => {
                    delayedAttempts += 1;

                    setTimeout(() => cancelledDuringDelay.abort(), 0);

                    throw new AgentToolError(
                        "TEMPORARY_FAILURE",
                        "The service is temporarily unavailable.",
                        true,
                    );
                },
                {
                    idempotent: true,
                    signal: cancelledDuringDelay.signal,
                },
            ),
        isAbortError,
    );

    assert.equal(delayedAttempts, 1);
    console.log("PASS: cancellation interrupts the retry delay.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});