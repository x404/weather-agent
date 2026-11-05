import path from "node:path";
import { mkdir, writeFile, rename } from "node:fs/promises";
import { loadKnowledge } from "../../knowledge-base/glossary-source";
import {
    KnowledgeIndexSchema,
    type KnowledgeIndex,
} from "../../knowledge-base/search-index-schema";
import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../../models/embeddings";

async function main() {
    const sourcePath = path.resolve(
        __dirname,
        "../../../data/knowledge/weather-glossary.json",
    );

    const indexPath = path.resolve(
        __dirname,
        "../../../.local/rag/knowledge-index.json",
    );

    const knowledge = await loadKnowledge(sourcePath);
    const chunks: KnowledgeIndex["chunks"] = [];

    for (const chunk of knowledge.chunks) {
        console.log("Creating embedding for:", chunk.chunkId);

        const embedding = await createEmbedding(chunk.text);

        chunks.push({
            ...chunk,
            embedding,
        });
    }

    const index = KnowledgeIndexSchema.parse({
        embeddingModel: EMBEDDING_MODEL,
        dimensions: chunks[0]?.embedding.length,
        chunks,
    });

    await mkdir(path.dirname(indexPath), { recursive: true });

    const temporaryPath = `${indexPath}.tmp`;

    await writeFile(
        temporaryPath,
        JSON.stringify(index, null, 2),
        "utf8",
    );

    await rename(temporaryPath, indexPath);

    console.log("Indexed chunks:", index.chunks.length);
    console.log("Dimensions:", index.dimensions);
    console.log("Index saved to:", indexPath);
}

main().catch((error) => {
    console.error("Index building failed:", error);
    process.exitCode = 1;
});