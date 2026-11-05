import { runAgent } from "../../agents/weather-agent";
import { createConversationSession } from "../../conversation/session";

async function main() {
    const session = createConversationSession(2);

    const questions = [
        "What is the weather in Berlin?",
        "What is the weather in Paris?",
        "What is the weather in Kyiv?",
        "Which city did I ask about first in this conversation? Answer from conversation history without fetching weather.",
    ];

    for (const question of questions) {
        const answer = await runAgent(question, { session });

        console.log("\nQuestion:", question);
        console.log("Answer:", answer);
        console.log("Saved turns:", session.turns.length);

        console.log("Summary:", session.summary || "(empty)");

        for (const turn of session.turns) {
            console.log("Saved question:", JSON.stringify(turn[0]));
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
