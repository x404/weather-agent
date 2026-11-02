import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

export async function connectWeatherMcp() {
    const dataDirectory = path.resolve(__dirname, "../../data");
    const reportPath = path.join(dataDirectory, "weather-report.txt");

    const serverPath = require.resolve(
        "@modelcontextprotocol/server-filesystem/dist/index.js",
    );

    const client = new Client({
        name: "weather-agent",
        version: "1.0.0",
    });

    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [serverPath, dataDirectory],
    });

    try {
        await client.connect(transport);

        const { tools } = await client.listTools();
        const allowedToolNames = new Set(
            tools
                .filter((tool) => tool.name === "read_text_file")
                .map((tool) => tool.name),
        );

        if (!allowedToolNames.has("read_text_file")) {
            throw new Error("The server does not provide read_text_file.");
        }

        return {
            async readReport() {
                const toolName = "read_text_file";

                if (!allowedToolNames.has(toolName)) {
                    throw new Error("The requested MCP tool is not allowed.");
                }

                const rawResult = await client.callTool({
                    name: toolName,
                    arguments: {
                        path: reportPath,
                    },
                });

                const result = CallToolResultSchema.parse(rawResult);

                const text = result.content
                    .filter((block) => block.type === "text")
                    .map((block) => block.text)
                    .join("\n");

                if (result.isError) {
                    return {
                        error: "Failed to read the training weather report.",
                    };
                }

                if (!text.trim()) {
                    return {
                        error: "The training weather report is empty.",
                    };
                }

                return { text };
            },

            async close() {
                await client.close();
            },
        };
    } catch (error) {
        await client.close();
        throw error;
    }
}
