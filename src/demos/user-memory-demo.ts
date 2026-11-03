import path from "node:path";
import {
    loadUserMemory,
    savePreferredCity,
} from "../memory/storage";

async function main() {
    const filePath = path.resolve(
        __dirname,
        "../../.local/memory/user-memory-demo.json",
    );

    const city = process.argv[2];

    if (city !== undefined) {
        await savePreferredCity(city, filePath);
        console.log("Preferred city saved.");
    }

    const memory = await loadUserMemory(filePath);
    console.log("User memory:", memory);
}

main().catch((error) => {
    console.error("User memory operation failed:", error);
    process.exitCode = 1;
});