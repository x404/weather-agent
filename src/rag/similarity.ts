export function cosineSimilarity(
    first: number[],
    second: number[],
): number {
    if (first.length === 0 || first.length !== second.length) {
        throw new Error("Vectors must have the same non-zero dimensions.");
    }

    let dotProduct = 0;
    let firstSquaredLength = 0;
    let secondSquaredLength = 0;

    for (let index = 0; index < first.length; index++) {
        const a = first[index];
        const b = second[index];

        if (!Number.isFinite(a) || !Number.isFinite(b)) {
            throw new Error("Vector values must be finite numbers.");
        }

        dotProduct += a * b;
        firstSquaredLength += a * a;
        secondSquaredLength += b * b;
    }

    const denominator =
        Math.sqrt(firstSquaredLength) *
        Math.sqrt(secondSquaredLength);

    if (denominator === 0) {
        throw new Error("Cannot compare a zero-length vector.");
    }

    const score = dotProduct / denominator;

    if (!Number.isFinite(score)) {
        throw new Error("Similarity calculation produced an invalid result.");
    }

    return Math.max(-1, Math.min(1, score));
}