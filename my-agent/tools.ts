/**
 * defines schema
 */
import {z } from "zod";
const fileChange = z.object({
    rootDir: z.string().min(1).describe("The root directory"),
});
type FileChange = z.infer<typeof fileChange>;

/**
 * use simple-git to get changes in the directory
 */

import {tool } from "ai";
import { simpleGit } from "simple-git";

//...previous code

const excludeFiles = ["dist", "bun.lock"];

async function getfileChangesInDirectory({rootDir}: FileChange) {
    const git = simpleGit(rootDir);
    const summary = await git.diffSummary();
    const diffs: { file: string; diff: string }[] = [];
    for (const file of summary.files) {
        if (excludeFiles.includes(file.file)) continue;
        const diff = await git.diff(["--", file.file]);
        diffs.push({ file: file.file, diff });
    }
    return diffs;
}

/**
 * define tool using helper from vercel sdk
 */

import { tool} from "ai";

//...previous code
export const getFileChangesInDirectoryTool = tool({
    description: "Gets the code changes made in a given directory",
    inputSchema: fileChange,
    execute: getfileChangesInDirectory,
});
