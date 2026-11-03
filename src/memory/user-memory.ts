import { z } from "zod";

export const PreferredCitySchema = z.enum([
    "Berlin",
    "Paris",
    "Kyiv",
]);

export const UserMemorySchema = z.object({
    version: z.literal(1),
    preferredCity: PreferredCitySchema.nullable(),
}).strict();

export type UserMemory = z.infer<typeof UserMemorySchema>;

export function createUserMemory(): UserMemory {
    return {
        version: 1,
        preferredCity: null,
    };
}