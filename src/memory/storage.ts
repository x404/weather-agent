import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import {
    createUserMemory,
    PreferredCitySchema,
    UserMemorySchema,
    type UserMemory,
} from "./user-memory";

export async function loadUserMemory(
    filePath: string,
): Promise<UserMemory> {
    let contents: string;

    try {
        contents = await readFile(filePath, "utf8");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return createUserMemory();
        }

        throw error;
    }

    return UserMemorySchema.parse(JSON.parse(contents));
}

export async function savePreferredCity(
    city: unknown,
    filePath: string,
): Promise<UserMemory> {
    const preferredCity = PreferredCitySchema.parse(city);

    const currentMemory = await loadUserMemory(filePath);

    const updatedMemory = UserMemorySchema.parse({
        ...currentMemory,
        preferredCity,
    });

    await mkdir(path.dirname(filePath), { recursive: true });

    const temporaryPath = `${filePath}.tmp`;
    const contents = JSON.stringify(updatedMemory, null, 2);

    await writeFile(temporaryPath, contents, "utf8");
    await rename(temporaryPath, filePath);

    return updatedMemory;
}