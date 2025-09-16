import {tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
    rootDir: z.string().min(1).describe("The root directory"),
});
type FileChange = z.infer<typeof fileChange>;


const commitInput = z.object({
	rootDir: z.string().min(1).describe("The root directory"),
	message: z.string().min(1).describe("The commit message"),
});
type CommitInput = z.infer<typeof commitInput>;
/**
 * defines schema for md file generation
 */
const markdownInput = z.object({
	content: z.string().min(1).describe("The new raw test content to convert to markdown "),
});
type MarkdownInput = z.infer<typeof markdownInput>;


/**
 * use simple-git to get changes in the directory
 */


async function getfileChangesInDirectory({ rootDir }: FileChange) {
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
/* commit changes */
async function commitChanges({ rootDir, message }: CommitInput) {
	const git = simpleGit(rootDir);
	await git.add("./*"); //stage all changes
	const result = await git.commit(message);
	return {
		committed: true,
		summary: result.summary,
	};
}
/*make md doc file*/
async function generateMarkdown({ content }: MarkdownInput) {
	const md = `#Review Summary\n\n${content}\n`;
	return { markdown: md };
}


/**
 * define tool using helper from vercel sdk
 * get file changes tool
 * commit changes tool
 * mdfile generation tool
 */
export const getFileChangesInDirectoryTool = tool({
    description: "Gets the code changes made in a given directory",
    inputSchema: fileChange,
    execute: getfileChangesInDirectory,
});
export const commitChangesTool = tool({
	description: "stages and commits changes in the given directory with a commit message",
	inputSchema: commitInput,
	execute: commitChanges,
});
export const generateMarkdownTool = tool({
	description: "converts plaintext into markdown format",
	inputSchema: markdownInput,
	execute: generateMarkdown,
});
