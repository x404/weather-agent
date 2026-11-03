import { runAgent } from "../agents/weather-agent";
import { createConversationSession } from "../conversation/session";

async function main() {
    const question = process.argv[2];

    if (!question) {
        throw new Error("Pass a question as a command-line argument.");
    }

    const session = createConversationSession();

    console.log("Initial conversation turns:", session.turns.length);

    const answer = await runAgent(question, {
        session,
        verbose: true,
    });

    console.log("Answer:", answer);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});