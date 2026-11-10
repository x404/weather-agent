import { z } from "zod";
import { client } from "./openrouter";

export const EMBEDDING_MODEL =
    process.env.OPENROUTER_EMBEDDING_MODEL?.trim() ||
    "openai/text-embedding-3-small";

const EmbeddingSchema = z.array(
    z.number().finite(),
).min(1);

export async function createEmbedding(
    text: string,
    signal?: AbortSignal,
): Promise<number[]> {
    if (!text.trim()) {
        throw new Error("Embedding input must not be empty.");
    }

    const response = await client.embeddings.create(
        {
            model: EMBEDDING_MODEL,
            input: text,
            encoding_format: "float",
        },
        { signal },
    );

    const item = response.data.find(
        (item) => item.index === 0,
    );

    return EmbeddingSchema.parse(item?.embedding);
}