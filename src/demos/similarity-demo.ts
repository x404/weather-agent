import { cosineSimilarity } from "../rag/similarity";

console.log(
    "Same direction:",
    cosineSimilarity([1, 0], [1, 0]),
);

console.log(
    "Perpendicular:",
    cosineSimilarity([1, 0], [0, 1]),
);

console.log(
    "Opposite directions:",
    cosineSimilarity([1, 0], [-1, 0]),
);