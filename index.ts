import { executeTool } from "./tools";
import { runAgent } from "./agent";

async function main() {
    // Step 1: Call geocode via registry
    const geoCall = {
        name: "geocode",
        arguments: { city: "Berlin" },
    };
    console.log(`1. Calling tool "${geoCall.name}" with:`, geoCall.arguments);
    const geoResult = await executeTool(geoCall.name, geoCall.arguments);
    console.log("Result:", geoResult);

    // Step 2: Call get_weather via registry using coordinates from geoResult
    if ("lat" in geoResult && "lon" in geoResult) {
        const weatherCall = {
            name: "get_weather",
            arguments: { lat: geoResult.lat, lon: geoResult.lon },
        };
        console.log(`\n2. Calling tool "${weatherCall.name}" with:`, weatherCall.arguments);
        const weatherResult = await executeTool(weatherCall.name, weatherCall.arguments);
        console.log("Result:", weatherResult);
    }

    // Step 3: Check tool call that is not in the registry
    const unknownCall = {
        name: "search_web",
        arguments: { query: "Berlin weather" },
    };
    console.log(`\n3. Calling tool "${unknownCall.name}" with:`, unknownCall.arguments);
    const unknownResult = await executeTool(unknownCall.name, unknownCall.arguments);
    console.log("Result:", unknownResult);

    // Step 4: Unknown city (geocode will return an error instead of coordinates)
    const unknownCityCall = {
        name: "geocode",
        arguments: { city: "Tokyo" },
    };
    console.log(`\n4. Calling tool "${unknownCityCall.name}" with:`, unknownCityCall.arguments);
    const unknownCityResult = await executeTool(unknownCityCall.name, unknownCityCall.arguments);
    console.log("Result:", unknownCityResult);

    // Step 5: Coordinates not found in the table (get_weather will return an error)
    const unknownCoordsCall = {
        name: "get_weather",
        arguments: { lat: 0, lon: 0 },
    };
    console.log(`\n5. Calling tool "${unknownCoordsCall.name}" with:`, unknownCoordsCall.arguments);
    const unknownCoordsResult = await executeTool(unknownCoordsCall.name, unknownCoordsCall.arguments);
    console.log("Result:", unknownCoordsResult);

    // Step 6: Full agent run — the model picks the tools itself
    console.log("\n6. Running the agent...");
    const answer = await runAgent("What's the weather in Berlin?", { verbose: true });
    console.log("Answer:", answer);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
