import path from "node:path";
import { runAgent } from "../../agents/weather-agent";
import { loadSession, saveSession } from "../../conversation/storage";

async function main() {
    const sessionPath = path.resolve(
        __dirname,
        "../../../.local/sessions/weather-session.json",
    );

    const session = await loadSession(sessionPath);

    console.log("Loaded turns:", session.turns.length);
    console.log("Loaded summary:", session.summary || "(empty)");

    const answer = await runAgent(
        "Which city did we discuss earlier, and what weather values did the two sources provide? Use the conversation history without fetching new weather data.",
        { session, verbose: true },
    );

    console.log("Answer:", answer.answer);

    await saveSession(session, sessionPath);
    console.log("Updated session saved.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});