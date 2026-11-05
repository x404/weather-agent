import test from "node:test";
import assert from "node:assert/strict";
import {
    answerFromContext,
    type AnswerGenerator,
} from "../../knowledge-base/answer-from-context";
import type { AnswerContext } from "../../knowledge-base/answer-context";

const context: AnswerContext = [
    {
        label: "[C1]",
        chunkId: "cloud-cover",
        source: "weather-glossary",
        text: "Partly cloudy means clouds and clear areas are present.",
        score: 0.6,
    },
    {
        label: "[C2]",
        chunkId: "wind",
        source: "weather-glossary",
        text: "Gusts are brief increases in wind speed.",
        score: 0.5,
    },
];

function fixedReply(
    text: string,
    status = "completed",
): AnswerGenerator {
    return async () => ({
        status,
        output_text: text,
    });
}

test("returns only used sources with complete metadata", async () => {
    const answer = "Clouds and clear areas are present [C1].";

    const result = await answerFromContext(
        "What does partly cloudy mean?",
        context,
        undefined,
        fixedReply(answer),
    );

    assert.equal(result.answer, answer);
    assert.deepEqual(result.sources, [
        {
            label: "[C1]",
            source: "weather-glossary",
            chunkId: "cloud-cover",
            score: 0.6,
        },
    ]);
});

const invalidReplies = [
    {
        name: "rejects an answer without citations",
        text: "Clouds and clear areas are present.",
        status: "completed",
        error: /missing or invalid source labels/,
    },
    {
        name: "rejects an invented citation beside a valid citation",
        text: "Clouds are present [C1]. Another claim [C99].",
        status: "completed",
        error: /missing or invalid source labels/,
    },
    {
        name: "rejects an empty answer",
        text: "   ",
        status: "completed",
        error: /empty answer/,
    },
    {
        name: "rejects incomplete generation",
        text: "Clouds are present [C1].",
        status: "incomplete",
        error: /did not complete/,
    },
];

for (const item of invalidReplies) {
    test(item.name, async () => {
        await assert.rejects(
            () => answerFromContext(
                "Explain the weather concept.",
                context,
                undefined,
                fixedReply(item.text, item.status),
            ),
            item.error,
        );
    });
}

test("accepts insufficient context after one generation call", async () => {
    let modelCallCount = 0;

    const generate: AnswerGenerator = async () => {
        modelCallCount++;

        return {
            status: "completed",
            output_text: "INSUFFICIENT_CONTEXT",
        };
    };

    const result = await answerFromContext(
        "Explain a detail absent from these fragments.",
        context,
        undefined,
        generate,
    );

    assert.deepEqual(result, {
        answer: "No relevant information found in the knowledge base.",
        sources: [],
    });

    assert.equal(modelCallCount, 1);
});