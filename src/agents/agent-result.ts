export type AgentStopReason =
    | "task_completed"
    | "max_steps"
    | "cancelled"
    | "repeated_tool_call"
    | "incomplete_response"
    | "model_error";
    
export type AgentResult = {
    answer: string;
    stopReason: AgentStopReason;
};