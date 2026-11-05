import path from "node:path";
import { loadKnowledge } from "../../knowledge-base/glossary-source";

async function main() {
    const filePath = path.resolve(
        __dirname,
        "../../../data/knowledge/weather-glossary.json",
    );

    const knowledge = await loadKnowledge(filePath);

    console.log("Loaded chunks:", knowledge.chunks.length);

    for (const chunk of knowledge.chunks) {
        console.log(`\n[${chunk.chunkId}]`);
        console.log("Source:", chunk.source);
        console.log("Text:", chunk.text);
    }
}

main().catch((error) => {
    console.error("Knowledge loading failed:", error);
    process.exitCode = 1;
});