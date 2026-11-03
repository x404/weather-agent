import { mkdir, writeFile, rename, readFile } from "node:fs/promises";
import path from "node:path";
import type { ConversationSession } from "./session";
import { z } from "zod";
import { createConversationSession } from "./session";
import {
    toResponseInputItems,
    type ResponseInputItemLike,
} from "openai/lib/responses/ResponseInputItems";


export async function saveSession(
    session: ConversationSession,
    filePath: string,
): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });

    const contents = JSON.stringify(
        {
            version: 1,
            turns: session.turns,
            maxTurns: session.maxTurns,
            summary: session.summary,
        },
        null,
        2,
    );

    const temporaryPath = `${filePath}.tmp`;

    await writeFile(temporaryPath, contents, "utf8");
    await rename(temporaryPath, filePath);
}

const SavedSessionSchema = z.object({
    version: z.literal(1),
    maxTurns: z.number().int().positive(),
    summary: z.string(),
    turns: z.array(
        z.array(z.record(z.string(), z.unknown())),
    ),
}).strict();

export async function loadSession(
    filePath: string,
): Promise<ConversationSession> {
    let contents: string;

    try {
        contents = await readFile(filePath, "utf8");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return createConversationSession();
        }

        throw error;
    }

    const saved = SavedSessionSchema.parse(JSON.parse(contents));

    const turns = saved.turns.map((turn) =>
        toResponseInputItems(
            turn as unknown as ResponseInputItemLike[],
        ),
    );

    return {
        turns,
        maxTurns: saved.maxTurns,
        summary: saved.summary,
    };
}