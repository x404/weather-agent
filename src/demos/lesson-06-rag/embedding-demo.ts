import {
    createEmbedding,
    EMBEDDING_MODEL,
} from "../../models/embeddings";

async function main() {
    const text = "What does partly cloudy mean?";
    const embedding = await createEmbedding(text);

    console.log("Model:", EMBEDDING_MODEL);
    console.log("Text:", text);
    console.log("Dimensions:", embedding.length);
    console.log("First five values:", embedding.slice(0, 5));
}

main().catch((error) => {
    console.error("Embedding request failed:", error);
    process.exitCode = 1;
});