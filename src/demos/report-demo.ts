import { runAgent } from "../agents/weather-agent";

async function main() {
    const answer = await runAgent(
        "According to the local training weather report, what is the weather in Kyiv according to the student summary?",
        { verbose: true },
    );

    console.log("Answer:", answer);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
