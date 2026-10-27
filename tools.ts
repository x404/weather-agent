type WeatherData = {
    temperature: number;
    condition: string;
};

const cities: Record<string, { lat: number; lon: number }> = {
    Berlin: { lat: 52.52, lon: 13.405 },
    Paris: { lat: 48.8566, lon: 2.3522 },
    Kyiv: { lat: 50.4501, lon: 30.5234 },
};

const weather: Record<string, WeatherData> = {
    "52.52,13.405": { temperature: 18, condition: "Partly cloudy" },
    "48.8566,2.3522": { temperature: 22, condition: "Sunny" },
    "50.4501,30.5234": { temperature: 15, condition: "Rainy" },
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
        description: data.condition,
    };
}