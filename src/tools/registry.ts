import { geocode, getWeather, geocodeArguments, getWeatherArguments, type ToolResult } from "./weather";

export const registry: Record<string, (args: unknown) => ToolResult> = {
    geocode: (args) => {
        const parsed = geocodeArguments.safeParse(args);
        if (!parsed.success) {
            return { error: "Argument city must be a non-empty string" };
        }
        return geocode(parsed.data.city);
    },
    get_weather: (args) => {
        const parsed = getWeatherArguments.safeParse(args);
        if (!parsed.success) {
            const invalidField = parsed.error.issues[0]?.path[0];
            if (invalidField === "lon") {
                return {
                    error: "Argument lon must be a finite number between -180 and 180",
                };
            }
            return {
                error: "Argument lat must be a finite number between -90 and 90",
            };
        }
        return getWeather(parsed.data.lat, parsed.data.lon);
    },
};

// Function to call a tool as the agent cycle would:
// by string name and object of arguments with safe check of existence in the registry
export async function executeTool(
    name: string,
    args: Record<string, unknown>,
) {
    if (!Object.hasOwn(registry, name)) {
        return { error: `Tool "${name}" not found in registry` };
    }

    return await registry[name](args);
}
