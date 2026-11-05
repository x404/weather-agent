import path from "node:path";
import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../models/embeddings";
import {
    loadKnowledgeIndex,
    rankChunks,
    selectRelevantChunks,
} from "./knowledge-search";
import { prepareAnswerContext } from "./answer-context";

export async function findAnswerContext(question: string) {
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
    const relevantChunks = selectRelevantChunks(rankedChunks);

    return prepareAnswerContext(relevantChunks);
}