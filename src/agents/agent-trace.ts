import type {
    AgentMetrics,
    AgentStopReason,
    AgentTokenUsage,
} from "./agent-result";

export type AgentStopTrace = {
    type: "agent_stop";
    step: number;
    stopReason: AgentStopReason;
    metrics: AgentMetrics;
};

export type AgentStepTrace = {
    type: "agent_step";
    step: number;
    modelStatus: string;
    modelLatencyMs: number;
    tokenUsage?: AgentTokenUsage;
};

export type AgentToolTrace = {
    type: "agent_tool";
    step: number;
    toolName: string;
    safeArguments: Record<string, string | number | boolean | null>;
    status: "succeeded" | "error" | "rejected" | "blocked";
    latencyMs: number;
    attempts: number;
    retryCount: number;
};

export type AgentTraceEvent =
    | AgentStepTrace
    | AgentToolTrace
    | AgentStopTrace;