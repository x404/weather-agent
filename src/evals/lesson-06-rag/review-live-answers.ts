import path from "node:path";
import { readFile } from "node:fs/promises";
import { RecordedRetrievalSchema } from "./evaluation-data-schema";
import {
    rankChunks,
    selectRelevantChunks,
} from "../../knowledge-base/knowledge-search";
import { prepareAnswerContext } from "../../knowledge-base/answer-context";
import { answerFromContext } from "../../knowledge-base/answer-from-context";

async function main() {
    const filePath = path.resolve(
        __dirname,
        "../../../data/evals/recorded-retrieval.json",
    );

    const recording = RecordedRetrievalSchema.parse(
        JSON.parse(await readFile(filePath, "utf8")),
    );

    const caseId = process.argv[2];

    const positiveCases = recording.cases.filter(
        (item) =>
            item.expectedTopChunkId !== null &&
            (caseId === undefined || item.id === caseId),
    );

    if (positiveCases.length === 0) {
        throw new Error("No matching positive evaluation cases.");
    }

    for (const item of positiveCases) {
        const ranked = rankChunks(
            recording.index,
            item.queryEmbedding,
        );

        const selected = selectRelevantChunks(ranked);
        const context = prepareAnswerContext(selected);

        console.log("\nCase:", item.id);
        console.log("Question:", item.question);

        for (const fragment of context) {
            console.log(
                "Reference:",
                fragment.label,
                fragment.chunkId,
            );
            console.log(fragment.text);
        }

        const result = await answerFromContext(
            item.question,
            context,
        );

        console.log("Answer:", result.answer);
        console.log("Sources:", result.sources);
    }

    console.log("\nGenerated answers:", positiveCases.length);
}

main().catch((error) => {
    console.error("Answer review failed:", error);
    process.exitCode = 1;
});