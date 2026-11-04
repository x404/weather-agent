import { z } from "zod";
import { KnowledgeChunkSchema } from "./knowledge";

export const IndexedChunkSchema = KnowledgeChunkSchema.extend({
    embedding: z.array(z.number().finite()).min(1),
});

export const KnowledgeIndexSchema = z.object({
    embeddingModel: z.string().trim().min(1),
    dimensions: z.number().int().positive(),
    chunks: z.array(IndexedChunkSchema).min(1),
}).strict().refine(
    (index) =>
        index.chunks.every(
            (chunk) => chunk.embedding.length === index.dimensions,
        ),
    { message: "All embeddings must match the index dimensions." },
).refine(
    (index) =>
        new Set(index.chunks.map((chunk) => chunk.chunkId)).size ===
        index.chunks.length,
    { message: "Chunk identifiers must be unique." },
);

export type KnowledgeIndex = z.infer<typeof KnowledgeIndexSchema>;