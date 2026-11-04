import path from "node:path";
import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../models/embeddings";
import {
    loadKnowledgeIndex,
    rankChunks,
    selectChunks
} from "../rag/retrieval";

async function main() {
    const question =
        process.argv[2] ?? "What does partly cloudy mean?";

    const indexPath = path.resolve(
        __dirname,
        "../../.local/rag/knowledge-index.json",
    );

    const index = await loadKnowledgeIndex(indexPath);

    if (index.embeddingModel !== EMBEDDING_MODEL) {
        throw new Error(
            "Embedding model mismatch. Rebuild the knowledge index.",
        );
    }

    const queryEmbedding = await createEmbedding(question);
    const rankedChunks = rankChunks(index, queryEmbedding);

    console.log("Question:", question);

    for (const chunk of rankedChunks) {
        console.log(
            chunk.chunkId,
            "score:",
            chunk.score.toFixed(4),
        );
    }

    const selectedChunks = selectChunks(rankedChunks);

    console.log(
        "Selected chunks:",
        selectedChunks.map((chunk) => chunk.chunkId),
    );

    if (selectedChunks.length === 0) {
        console.log("No relevant information found in the knowledge base.");
    }
}

main().catch((error) => {
    console.error("Retrieval failed:", error);
    process.exitCode = 1;
});