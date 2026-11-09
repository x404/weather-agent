import { geocode, getWeather, geocodeArguments, getWeatherArguments, type ToolResult } from "./weather";

type RepeatedCallCheck = (
    name: string,
    args: Record<string, unknown>,
) => boolean;

type ToolExecutionResult =
    | ToolResult
    | { stopReason: "repeated_tool_call" };

export const registry: Record<
    string,
    (
        args: unknown,
        shouldStop?: RepeatedCallCheck,
            onExecutionAttempt?: () => void,
        ) => ToolExecutionResult
> = {
    geocode: (args, shouldStop, onExecutionAttempt) => {
        const parsed = geocodeArguments.safeParse(args);
        if (!parsed.success) {
            return { error: "Argument city must be a non-empty string" };
        }
        if (shouldStop?.("geocode", parsed.data)) {
            return { stopReason: "repeated_tool_call" };
        }
        onExecutionAttempt?.();
        return geocode(parsed.data.city);
    },
    get_weather: (args, shouldStop, onExecutionAttempt) => {
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
        if (shouldStop?.("get_weather", parsed.data)) {
            return { stopReason: "repeated_tool_call" };
        }
        onExecutionAttempt?.();
        return getWeather(parsed.data.lat, parsed.data.lon);
    },
};

// Function to call a tool as the agent cycle would:
// by string name and object of arguments with safe check of existence in the registry
export async function executeTool(
    name: string,
    args: Record<string, unknown>,
    shouldStop?: RepeatedCallCheck,
    onExecutionAttempt?: () => void,
) {
    if (!Object.hasOwn(registry, name)) {
        return { error: `Tool "${name}" not found in registry` };
    }

    return await registry[name](args, shouldStop, onExecutionAttempt);
}
