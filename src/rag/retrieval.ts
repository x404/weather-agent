import { readFile } from "node:fs/promises";
import {
    KnowledgeIndexSchema,
    type KnowledgeIndex,
} from "./index-schema";
import { cosineSimilarity } from "./similarity";

export async function loadKnowledgeIndex(
    filePath: string,
): Promise<KnowledgeIndex> {
    const contents = await readFile(filePath, "utf8");

    return KnowledgeIndexSchema.parse(JSON.parse(contents));
}

export function rankChunks(
    index: KnowledgeIndex,
    queryEmbedding: number[],
) {
    if (queryEmbedding.length !== index.dimensions) {
        throw new Error("Query dimensions do not match the index.");
    }

    return index.chunks
        .map((chunk) => ({
            ...chunk,
            score: cosineSimilarity(
                queryEmbedding,
                chunk.embedding,
            ),
        }))
        .sort((first, second) => second.score - first.score);
}

export function selectChunks(
    rankedChunks: ReturnType<typeof rankChunks>,
    threshold = 0.5,
    topK = 2,
) {
    if (
        !Number.isFinite(threshold) ||
        threshold < -1 ||
        threshold > 1
    ) {
        throw new Error("Threshold must be between -1 and 1.");
    }

    if (!Number.isInteger(topK) || topK < 1) {
        throw new Error("topK must be a positive integer.");
    }

    return rankedChunks
        .filter((chunk) => chunk.score >= threshold)
        .slice(0, topK);
}