import path from "node:path";
import { loadSession } from "../../conversation/storage";

async function main() {
    const filePath = path.resolve(
        process.argv[2] ??
        ".local/sessions/weather-session.json",
    );

    const session = await loadSession(filePath);

    console.log("File:", filePath);
    console.log("Loaded turns:", session.turns.length);
    console.log("Max turns:", session.maxTurns);
    console.log("Summary:", session.summary || "(empty)");
}

main().catch((error) => {
    console.error("Session loading failed:", error);
    process.exitCode = 1;
});