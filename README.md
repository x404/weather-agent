# weather-agent

A training weather agent. Weather data and the local report contain sample values, not live forecasts.

## Project structure

```text
src/
  index.ts                       # Main usage example
  agents/
    weather-agent.ts             # Agent loop and system prompt
  models/
    openrouter.ts                # Model client and tool call parsing
  mcp/
    weather-report-client.ts     # MCP connection and report reading
  tools/
    weather.ts                   # Weather functions, schemas, and tool definitions
    weather-report.ts            # Report tool schema and definition
    registry.ts                  # Local tool registry and execution
  knowledge-base/                # Glossary sources, search, and contextual answers
  demos/
    ask-agent.ts                 # Run the main agent with a question
    lesson-04-mcp/
      mcp-demo.ts                # Read the report directly through MCP
      report-demo.ts             # Query the report through the agent
    lesson-05-memory/            # Conversation and user memory examples
    lesson-06-rag/               # Knowledge, embeddings, retrieval, and RAG examples
    lesson-07-agent-loop/        # Agent loop, tracing, retry, and cancellation demos
data/
  weather-report.txt             # Training report
```

## Running the examples

Install dependencies: `npm install`.

For examples that use a model, configure `.env` using `.env.example` as a template.
Run these commands from the project root:

```sh
node --env-file=.env --import tsx src/index.ts
node --env-file=.env --import tsx src/demos/lesson-04-mcp/report-demo.ts
```

The direct MCP example does not require a model API key:

```sh
node --import tsx src/demos/lesson-04-mcp/mcp-demo.ts
```

Type checking: `npx tsc --noEmit`.


## Lesson 7: Agent loop

The weather agent returns an answer, a stop reason, and run metrics. The metrics track model calls, proposed tool calls, execution attempts, reported token usage, and elapsed time up to result creation. Trace events describe model steps, tool execution, and the reason the run stopped.

Run these commands from the project root.

```bash
npx tsx src/demos/lesson-07-agent-loop/tool-call-signature-demo.ts
npx tsx src/demos/lesson-07-agent-loop/tool-retry-demo.ts
npx tsx --env-file=.env src/demos/lesson-07-agent-loop/cancellation-demo.ts
npx tsx --env-file=.env src/demos/lesson-07-agent-loop/repeated-call-demo.ts
npx tsx --env-file=.env src/demos/lesson-07-agent-loop/self-correction-demo.ts
npx tsx --env-file=.env src/demos/lesson-07-agent-loop/agent-retry-demo.ts
```

| Demo | What it checks |
| --- | --- |
| `tool-call-signature-demo.ts` | Reordering argument keys preserves the call signature. Changing argument values changes it. |
| `tool-retry-demo.ts` | Retries are bounded, require a transient failure and an idempotent operation, and can be cancelled during the delay. |
| `cancellation-demo.ts` | A run cancelled before it starts returns `cancelled`. |
| `repeated-call-demo.ts` | The third identical call in a row is blocked after two executions. |
| `self-correction-demo.ts` | The next model input includes the validation error, and a scripted correction lets the run continue. |
| `agent-retry-demo.ts` | One proposed search takes two attempts and returns one result to the model. A second run verifies cancellation during the search. |

The agent demos use scripted responses or cancel before the first model call. The `.env` file is required by the model client's initialization. The retry and cancellation scenarios use a simulated glossary search.

Run `npm run check:lesson6` to check the existing RAG behavior. This command covers type checking, answer validation, retrieval, and refusal without generation.
