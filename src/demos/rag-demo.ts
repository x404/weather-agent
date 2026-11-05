import { findAnswerContext } from "../rag/find-answer-context";
import { answerFromContext } from "../rag/answer";

async function main() {
    const question =
        process.argv[2] ?? "What does partly cloudy mean?";

    const context = await findAnswerContext(question);

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