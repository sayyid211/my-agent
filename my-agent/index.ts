/**
 * Main entry point for the agent
 * models/gemini-2.5-flash
 * system prompt from prompts.ts
 * tools from tools.ts
 * prompt user input
 */
import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import { getFileChangesInDirectoryTool } from "./tools";
import { commitChangesTool } from "./tools";
import { generateMarkdownTool } from "./tools";

const codeReviewAgent = async (prompt: string) => {
    const result = streamText({
        model: google("models/gemini-2.5-flash"),
        prompt,
        system: SYSTEM_PROMPT,
        tools: {
            getFileChangesInDirectoryTool: getFileChangesInDirectoryTool,
            commitChangesTool: commitChangesTool,
            generateMarkdownTool: generateMarkdownTool,
        },
        stopWhen: stepCountIs(20),
    });
    for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
    }
};
  
// specify code base to be reviewed
await codeReviewAgent(
    "Review the code changes in `.` directory, make your reviews and suggestions file by file."
);