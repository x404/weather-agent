import { findAnswerContext } from "../../knowledge-base/search-glossary.js";
import { geocode, getWeather } from "../../tools/weather.js";

function readWeather(city: string) {
    const coordinates = geocode(city);
    if (coordinates.error !== undefined) {
        return { error: `Could not find coordinates for ${city}: ${coordinates.error}` };
    }

    const weather = getWeather(coordinates.lat, coordinates.lon);
    if (weather.error !== undefined) {
        return { error: `Could not get weather for ${city}: ${weather.error}` };
    }

    return {
        summary: `${city}: ${weather.temperature} °C, ${weather.description} (sample data).`,
        description: weather.description,
    };
}

function findDefinition(term: string) {
    return findAnswerContext(`What does "${term}" mean?`);
}

async function buildWeatherSummary(city: string, term?: string): Promise<string> {
    if (term) {
        const [[definition], weather] = await Promise.all([
            findDefinition(term),
            readWeather(city),
        ]);

        const summary = weather.error ?? weather.summary;
        return definition
            ? `${summary}\nGlossary (${definition.source}): ${definition.text}`
            : summary;
    }

    const weather = readWeather(city);
    if (weather.error !== undefined) {
        return weather.error;
    }

    const [definition] = await findDefinition(weather.description);
    return definition
        ? `${weather.summary}\nGlossary (${definition.source}): ${definition.text}`
        : weather.summary;
}

const city = process.argv[2]?.trim() || "Berlin";
const term = process.argv[3]?.trim();

buildWeatherSummary(city, term)
    .then((summary) => console.log(summary))
    .catch((error: unknown) => {
        console.error("Weather workflow failed:", error);
        process.exitCode = 1;
    });