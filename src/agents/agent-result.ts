export type AgentStopReason =
    | "task_completed"
    | "max_steps"
    | "cancelled"
    | "repeated_tool_call"
    | "incomplete_response"
    | "model_error";
    
export type AgentTokenUsage = {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
};

export type AgentMetrics = {
    modelCallCount: number;
    toolCallCount: number;
    toolExecutionAttemptCount: number;
    tokenUsage?: AgentTokenUsage;
};

export type AgentResult = {
    answer: string;
    stopReason: AgentStopReason;
    metrics: AgentMetrics;
};