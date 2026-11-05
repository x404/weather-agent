import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import {
    RetrievalCasesSchema,
    RecordedRetrievalSchema,
} from "./evaluation-data-schema";
import {
    rankChunks,
    selectRelevantChunks,
} from "../../knowledge-base/knowledge-search";
import { loadKnowledge } from "../../knowledge-base/glossary-source";

async function main() {
    const dataDirectory = path.resolve(__dirname, "../../../data");

    const recording = RecordedRetrievalSchema.parse(
        JSON.parse(
            await readFile(
                path.join(dataDirectory, "evals/recorded-retrieval.json"),
                "utf8",
            ),
        ),
    );

    const expectedCases = RetrievalCasesSchema.parse(
        JSON.parse(
            await readFile(
                path.join(dataDirectory, "evals/retrieval-cases.json"),
                "utf8",
            ),
        ),
    );

    assert.deepEqual(
        recording.cases.map(({ queryEmbedding, ...item }) => item),
        expectedCases,
        "Questions or expectations changed. Update the recording.",
    );

    const knowledge = await loadKnowledge(
        path.join(dataDirectory, "knowledge/weather-glossary.json"),
    );

    assert.deepEqual(
        recording.index.chunks.map(({ embedding, ...chunk }) => chunk),
        knowledge.chunks,
        "Knowledge texts changed. Rebuild the index and recording.",
    );

    let passed = 0;
    let refusalPassed = 0;
    let refusalTotal = 0;

    for (const item of recording.cases) {
        const ranked = rankChunks(
            recording.index,
            item.queryEmbedding,
        );

        const selected = selectRelevantChunks(ranked);
        const shouldRefuse = item.expectedTopChunkId === null;

        const success = shouldRefuse
            ? selected.length === 0
            : selected[0]?.chunkId === item.expectedTopChunkId;

        if (success) {
            passed++;
        }

        if (shouldRefuse) {
            refusalTotal++;

            if (success) {
                refusalPassed++;
            }
        }

        console.log(`${success ? "PASS" : "FAIL"} ${item.id}`, {
            expected: item.expectedTopChunkId ?? "no context",
            selected: selected.map((chunk) => chunk.chunkId),
            bestScore: ranked[0]?.score.toFixed(4),
        });
    }

    console.log(`Retrieval: ${passed}/${recording.cases.length}`);
    console.log(`Empty-context cases: ${refusalPassed}/${refusalTotal}`);

    if (passed !== recording.cases.length) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error("Retrieval evaluation failed:", error);
    process.exitCode = 1;
});