import { z } from "zod";
import { KnowledgeIndexSchema } from "../../knowledge-base/search-index-schema";

export const RetrievalCaseSchema = z.object({
    id: z.string().min(1),
    question: z.string().min(1),
    expectedTopChunkId: z.string().min(1).nullable(),
}).strict();

export const RetrievalCasesSchema = z.array(
    RetrievalCaseSchema,
).min(1).refine(
    (cases) =>
        new Set(cases.map((item) => item.id)).size === cases.length,
    { message: "Evaluation case identifiers must be unique." },
);

const RecordedCaseSchema = RetrievalCaseSchema.extend({
    queryEmbedding: z.array(z.number().finite()).min(1),
});

export const RecordedRetrievalSchema = z.object({
    version: z.literal(1),
    index: KnowledgeIndexSchema,
    cases: z.array(RecordedCaseSchema).min(1),
}).strict().refine(
    (recording) =>
        recording.cases.every(
            (item) =>
                item.queryEmbedding.length ===
                recording.index.dimensions,
        ),
    { message: "Query embeddings must match the index dimensions." },
);

export type RecordedRetrieval = z.infer<
    typeof RecordedRetrievalSchema
>;