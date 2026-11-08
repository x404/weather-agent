function sortObjectKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .sort(([firstKey], [secondKey]) =>
                    firstKey.localeCompare(secondKey),
                )
                .map(([key, item]) => [key, sortObjectKeys(item)]),
        );
    }

    return value;
}

export function createToolCallSignature(
    name: string,
    args: Record<string, unknown>,
): string {
    return `${name}:${JSON.stringify(sortObjectKeys(args))}`;
}