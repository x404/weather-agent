import path from "node:path";
import { runAgent } from "../../agents/weather-agent";
import { createConversationSession } from "../../conversation/session";
import { saveSession } from "../../conversation/storage";

async function main() {
    const session = createConversationSession();

    const firstAnswer = await runAgent(
        "What is the weather in Kyiv?",
        { session, verbose: true },
    );

    console.log("First answer:", firstAnswer.answer);

    const secondAnswer = await runAgent(
        "And what does the local training weather report say about that same city?",
        { session, verbose: true },
    );

    console.log("Second answer:", secondAnswer.answer);

    const sessionPath = path.resolve(
        __dirname,
        "../../../.local/sessions/weather-session.json",
    );

    await saveSession(session, sessionPath);

    console.log("Session saved to:", sessionPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});