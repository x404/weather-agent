import { z } from "zod";
import { zodResponsesFunction } from "openai/helpers/zod";
import { PreferredCitySchema } from "../memory/user-memory";

export const SavePreferredCityArgsSchema = z.object({
    city: PreferredCitySchema.describe(
        "The preferred city explicitly specified by the user.",
    ),
}).strict();

export const savePreferredCityTool = zodResponsesFunction({
    name: "save_preferred_city",
    description:
        "Save the user's preferred city for future conversations. " +
        "Use only when the user explicitly asks to remember or update it. " +
        "Do not infer a preference from an ordinary weather question. " +
        "Supported cities: Berlin, Paris, Kyiv.",
    parameters: SavePreferredCityArgsSchema,
});