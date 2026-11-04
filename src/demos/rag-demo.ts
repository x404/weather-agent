import path from "node:path";
import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../models/embeddings";
import {
    loadKnowledgeIndex,
    rankChunks,
    selectChunks,
} from "../rag/retrieval";
import { prepareAnswerContext } from "../rag/answer-context";
import { answerFromContext } from "../rag/answer";

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
    const selectedChunks = selectChunks(rankedChunks);
    const context = prepareAnswerContext(selectedChunks);

    console.log("Question:", question);
    console.log(
        "Selected chunks:",
        context.map(({ label, chunkId, score }) => ({
            label,
            chunkId,
            score,
        })),
    );

    console.log(
        "Answer generation:",
        context.length > 0 ? "requested" : "skipped (empty context)",
    );

    const result = await answerFromContext(question, context);

    console.log("Answer:", result.answer);
    console.log("Sources:", result.sources);
}

main().catch((error) => {
    console.error("RAG failed:", error);
    process.exitCode = 1;
});