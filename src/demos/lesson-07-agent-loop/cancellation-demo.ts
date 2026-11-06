import { runAgent } from "../../agents/weather-agent";

async function main(): Promise<void> {
    const controller = new AbortController();

    controller.abort();

    const result = await runAgent("What is the weather in Kyiv?", {
        signal: controller.signal,
        verbose: true,
    });

    console.log("Answer:", result.answer);
    console.log("Stop reason:", result.stopReason);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});