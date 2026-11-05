import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { RecordedRetrievalSchema } from "./evaluation-data-schema";
import {
    rankChunks,
    selectRelevantChunks,
} from "../../knowledge-base/knowledge-search";
import { prepareAnswerContext } from "../../knowledge-base/answer-context";
import {
    answerFromContext,
    type AnswerGenerator,
} from "../../knowledge-base/answer-from-context";

async function main() {
    const filePath = path.resolve(
        __dirname,
        "../../../data/evals/recorded-retrieval.json",
    );

    const recording = RecordedRetrievalSchema.parse(
        JSON.parse(await readFile(filePath, "utf8")),
    );

    const refusalCases = recording.cases.filter(
        (item) => item.expectedTopChunkId === null,
    );

    assert.equal(refusalCases.length, 5);

    let passed = 0;

    for (const item of refusalCases) {
        const ranked = rankChunks(
            recording.index,
            item.queryEmbedding,
        );

        const selected = selectRelevantChunks(ranked);
        const context = prepareAnswerContext(selected);

        let modelCallCount = 0;

        const failIfCalled: AnswerGenerator = async () => {
            modelCallCount++;

            throw new Error(
                `Generation unexpectedly requested for: ${item.id}`,
            );
        };

        const result = await answerFromContext(
            item.question,
            context,
            undefined,
            failIfCalled,
        );

        assert.deepEqual(result, {
            answer: "No relevant information found in the knowledge base.",
            sources: [],
        });

        assert.equal(modelCallCount, 0);

        passed++;

        console.log(`PASS ${item.id}`, {
            modelCallCount,
            sources: result.sources,
        });
    }

    console.log(`Refusals without generation: ${passed}/5`);
}

main().catch((error) => {
    console.error("Refusal evaluation failed:", error);
    process.exitCode = 1;
});