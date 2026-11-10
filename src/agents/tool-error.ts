export class AgentToolError extends Error {
    constructor(
        readonly code: string,
        readonly publicMessage: string,
        readonly retryable: boolean,
    ) {
        super(publicMessage);
        this.name = "AgentToolError";
    }
}