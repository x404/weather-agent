import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

async function main() {
    const dataDirectory = path.resolve(__dirname, "../../../data");
    const reportPath = path.join(dataDirectory, "weather-report.txt");

    const serverPath = require.resolve(
        "@modelcontextprotocol/server-filesystem/dist/index.js",
    );

    const client = new Client({
        name: "weather-agent-demo",
        version: "1.0.0",
    });

    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [serverPath, dataDirectory],
    });

    try {
        await client.connect(transport);
        console.log("Connected to the filesystem MCP server.");

        const { tools } = await client.listTools();

        const allowedTools = tools.filter(
            (tool) => tool.name === "read_text_file",
        );

        console.log(
            "Allowed tools:",
            allowedTools.map((tool) => tool.name),
        );

        const toolName = "read_text_file";

        if (!allowedTools.some((tool) => tool.name === toolName)) {
            throw new Error("The requested tool is not allowed or unavailable.");
        }

        const rawResult = await client.callTool({
            name: toolName,
            arguments: {
                path: reportPath,
            },
        });

        const result = CallToolResultSchema.parse(rawResult);

        if (result.isError) {
            console.error("The MCP tool returned an error:", result.content);
            process.exitCode = 1;
            return;
        }

        for (const block of result.content) {
            if (block.type === "text") {
                console.log(block.text);
            }
        }
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
