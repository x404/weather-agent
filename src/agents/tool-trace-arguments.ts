export function getSafeToolArguments(
    name: string,
    args: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
    switch (name) {
        case "geocode":
        case "save_preferred_city":
            return {
                cityLength:
                    typeof args.city === "string" ? args.city.length : 0,
            };

        case "search_weather_glossary":
            return {
                questionLength:
                    typeof args.question === "string"
                        ? args.question.length
                        : 0,
            };

        case "get_weather":
            return {
                hasLatitude: typeof args.lat === "number",
                hasLongitude: typeof args.lon === "number",
            };

        default:
            return {};
    }
}