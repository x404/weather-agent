import { zodResponsesFunction } from "openai/helpers/zod";
import { z } from "zod";

export const WeatherReportArgsSchema = z.object({}).strict();

export const weatherReportTool = zodResponsesFunction({
    name: "read_weather_report",
    description:
        "Read the local training weather report for Berlin, Paris and Kyiv. " +
        "Use this tool when the user asks about the report, the file, " +
        "or the training weather summary. " +
        "The report contains sample data, not live weather.",
    parameters: WeatherReportArgsSchema,
});