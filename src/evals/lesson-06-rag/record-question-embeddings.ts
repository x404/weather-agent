import path from "node:path";
import { readFile, writeFile, rename } from "node:fs/promises";
import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../../models/embeddings";
import { loadKnowledgeIndex } from "../../knowledge-base/knowledge-search";
import {
    RetrievalCasesSchema,
    RecordedRetrievalSchema,
    type RecordedRetrieval,
} from "./evaluation-data-schema";

async function main() {
    const casesPath = path.resolve(
        __dirname,
        "../../../data/evals/retrieval-cases.json",
    );

    const indexPath = path.resolve(
        __dirname,
        "../../../.local/rag/knowledge-index.json",
    );

    const outputPath = path.resolve(
        __dirname,
        "../../../data/evals/recorded-retrieval.json",
    );

    const cases = RetrievalCasesSchema.parse(
        JSON.parse(await readFile(casesPath, "utf8")),
    );

    const index = await loadKnowledgeIndex(indexPath);

    if (index.embeddingModel !== EMBEDDING_MODEL) {
        throw new Error("Embedding model does not match the index.");
    }

    const chunkIds = new Set(
        index.chunks.map((chunk) => chunk.chunkId),
    );

    for (const item of cases) {
        if (
            item.expectedTopChunkId !== null &&
            !chunkIds.has(item.expectedTopChunkId)
        ) {
            throw new Error(`Unknown expected chunk in case: ${item.id}`);
        }
    }

    const recordedCases: RecordedRetrieval["cases"] = [];

    for (const item of cases) {
        console.log("Recording query:", item.id);

        const queryEmbedding = await createEmbedding(item.question);

        if (queryEmbedding.length !== index.dimensions) {
            throw new Error(`Embedding dimensions mismatch: ${item.id}`);
        }

        recordedCases.push({
            ...item,
            queryEmbedding,
        });
    }

    const recording = RecordedRetrievalSchema.parse({
        version: 1,
        index,
        cases: recordedCases,
    });

    const temporaryPath = `${outputPath}.tmp`;

    await writeFile(
        temporaryPath,
        JSON.stringify(recording, null, 2),
        "utf8",
    );

    await rename(temporaryPath, outputPath);

    console.log("Recorded cases:", recording.cases.length);
    console.log("Saved to:", outputPath);
}

main().catch((error) => {
    console.error("Recording failed:", error);
    process.exitCode = 1;
});