import type { selectRelevantChunks } from "./knowledge-search";

export function prepareAnswerContext(
    chunks: ReturnType<typeof selectRelevantChunks>,
) {
    return chunks.map((chunk, index) => ({
        label: `[C${index + 1}]`,
        chunkId: chunk.chunkId,
        source: chunk.source,
        text: chunk.text,
        score: chunk.score,
    }));
}

export type AnswerContext = ReturnType<typeof prepareAnswerContext>;
