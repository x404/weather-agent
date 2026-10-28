import type { OpenAI } from "openai";

type WeatherData = {
    temperature: number;
    description: string;
};

const cities: Record<string, { lat: number; lon: number }> = {
    Berlin: { lat: 52.52, lon: 13.405 },
    Paris: { lat: 48.8566, lon: 2.3522 },
    Kyiv: { lat: 50.4501, lon: 30.5234 },
};

const weather: Record<string, WeatherData> = {
    "52.52,13.405": { temperature: 18, description: "Partly cloudy" },
    "48.8566,2.3522": { temperature: 22, description: "Sunny" },
    "50.4501,30.5234": { temperature: 15, description: "Rainy" },
};

export function geocode(city: string) {
    if (!Object.hasOwn(cities, city)) return { error: "City not found" };
    const { lat, lon } = cities[city];
    return { lat, lon };
}

export function getWeather(lat: number, lon: number) {
    const key = `${lat},${lon}`;
    const data = weather[key];

    if (!data) {
        return { error: `Weather data not found for coordinates: ${lat}, ${lon}` };
    }

    return {
        temperature: data.temperature,
        description: data.description,
    };
}

export const tools: OpenAI.Responses.Tool[] = [
    {
        type: "function",
        name: "geocode",
        description: "Get latitude and longitude coordinates for a city name.",
        parameters: {
            type: "object",
            properties: {
                city: {
                    type: "string",
                    description: "Name of the city, e.g. Berlin, Paris, Kyiv",
                },
            },
            required: ["city"],
            additionalProperties: false,
        },
        strict: true,
    },
    {
        type: "function",
        name: "get_weather",
        description:
            "Get the current weather (temperature and conditions) for given latitude and longitude coordinates. Coordinates must be obtained from the geocode tool first.",
        parameters: {
            type: "object",
            properties: {
                lat: {
                    type: "number",
                    description: "Latitude coordinate of the location, obtained from geocode",
                },
                lon: {
                    type: "number",
                    description: "Longitude coordinate of the location, obtained from geocode",
                },
            },
            required: ["lat", "lon"],
            additionalProperties: false,
        },
        strict: true,
    },
];

export const registry: Record<string, (args: any) => any> = {
    geocode: (args: { city: string }) => geocode(args.city),
    get_weather: (args: { lat: number; lon: number }) => getWeather(args.lat, args.lon),
};