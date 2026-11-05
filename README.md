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
