import type { OpenAI } from "openai";

export type ConversationSession = {
    turns: OpenAI.Responses.ResponseInput[];
    maxTurns: number;
    summary: string;
};

export function createConversationSession(
    maxTurns = 3,
): ConversationSession {
    if (!Number.isInteger(maxTurns) || maxTurns < 1) {
        throw new Error("maxTurns must be a positive integer.");
    }

    return {
        turns: [],
        maxTurns,
        summary: "",
    };
}