import { createToolCallSignature } from "../../agents/tool-call-signature";

const first = createToolCallSignature("get_weather", {
    lat: 50.45,
    lon: 30.52,
});

const reordered = createToolCallSignature("get_weather", {
    lon: 30.52,
    lat: 50.45,
});

const different = createToolCallSignature("get_weather", {
    lat: 52.52,
    lon: 13.405,
});

console.log("First:", first);
console.log("Reordered:", reordered);
console.log("Same arguments:", first === reordered);
console.log("Different coordinates:", first === different);