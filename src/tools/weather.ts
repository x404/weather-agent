import type { OpenAI } from "openai";
import { zodResponsesFunction } from "openai/helpers/zod";
import { z } from "zod";

type WeatherData = {
    temperature: number;
    description: string;
};

export type ToolResult = { error: string } | { lat: number; lon: number } | WeatherData;

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

export const geocodeArguments = z.object({
    city: z
        .string()
        .min(1)
        .refine((city) => city.trim() !== "")
        .describe("Name of the city, e.g. Berlin, Paris, Kyiv"),
});

export const getWeatherArguments = z.object({
    lat: z
        .number()
        .finite()
        .min(-90)
        .max(90)
        .describe("Latitude coordinate of the location, obtained from geocode"),
    lon: z
        .number()
        .finite()
        .min(-180)
        .max(180)
        .describe("Longitude coordinate of the location, obtained from geocode"),
});

export const tools: OpenAI.Responses.Tool[] = [
    zodResponsesFunction({
        name: "geocode",
        description: "Get latitude and longitude coordinates for a city name.",
        parameters: geocodeArguments,
    }),
    zodResponsesFunction({
        name: "get_weather",
        description:
            "Get the current weather (temperature and conditions) for given latitude and longitude coordinates. Coordinates must be obtained from the geocode tool first.",
        parameters: getWeatherArguments,
    }),
];
