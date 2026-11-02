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
  demos/
    mcp-demo.ts                  # Read the report directly through MCP
    report-demo.ts               # Query the report through the agent
data/
  weather-report.txt             # Training report
```

## Running the examples

Install dependencies: `npm install`.

For examples that use a model, configure `.env` using `.env.example` as a template.
Run these commands from the project root:

```sh
node --env-file=.env --import tsx src/index.ts
node --env-file=.env --import tsx src/demos/report-demo.ts
```

The direct MCP example does not require a model API key:

```sh
node --import tsx src/demos/mcp-demo.ts
```

Type checking: `npx tsc --noEmit`.
