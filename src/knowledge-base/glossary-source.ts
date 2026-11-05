import { readFile } from "node:fs/promises";
import { z } from "zod";

export const KnowledgeChunkSchema = z.object({
    chunkId: z.string().trim().min(1),
    source: z.string().trim().min(1),
    text: z.string().trim().min(1),
}).strict();

export const KnowledgeSchema = z.object({
    chunks: z.array(KnowledgeChunkSchema)
        .min(1)
        .refine(
            (chunks) =>
                new Set(chunks.map((chunk) => chunk.chunkId)).size ===
                chunks.length,
            { message: "Chunk identifiers must be unique." },
        ),
}).strict();

export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

export async function loadKnowledge(filePath: string) {
    const contents = await readFile(filePath, "utf8");

    return KnowledgeSchema.parse(JSON.parse(contents));
}