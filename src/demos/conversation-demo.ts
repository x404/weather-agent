import { runAgent } from "../agents/weather-agent";
import { createConversationSession } from "../conversation/session";

async function main() {
    const session = createConversationSession();

    const firstAnswer = await runAgent(
        "What is the weather in Kyiv?",
        { session, verbose: true },
    );

    console.log("First answer:", firstAnswer);

    const secondAnswer = await runAgent(
        "And what does the local training weather report say about that same city?",
        { session, verbose: true },
    );

    console.log("Second answer:", secondAnswer);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});