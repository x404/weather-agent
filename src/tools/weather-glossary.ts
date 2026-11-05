import { z } from "zod";
import { zodResponsesFunction } from "openai/helpers/zod";

export const WeatherGlossaryArgsSchema = z.object({
    question: z.string()
        .trim()
        .min(1)
        .max(1000)
        .describe(
            "A complete question about a weather concept. " +
            "Resolve references using the conversation history.",
        ),
}).strict();

export const weatherGlossaryTool = zodResponsesFunction({
    name: "search_weather_glossary",
    description:
        "Search the local weather glossary for explanations of " +
        "cloud cover, precipitation, wind and relative humidity. " +
        "Use for questions about the meaning of weather concepts. " +
        "Returns relevant text fragments with source labels. " +
        "Does not provide weather readings for a city.",
    parameters: WeatherGlossaryArgsSchema,
});