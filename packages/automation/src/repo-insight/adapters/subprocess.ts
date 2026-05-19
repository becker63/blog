import { spawn } from "node:child_process";

const splitArgs = (value: string | undefined, fallback: string[]) =>
  value?.trim() ? value.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((arg) => arg.replace(/^"|"$/g, "")) ?? [] : fallback;

export const cursorCliCommand = () => ({
  command: process.env.CURSOR_CLI_PATH ?? "cursor-agent",
  args: splitArgs(process.env.CURSOR_CLI_ARGS, ["prompt", "--json"]),
});

export const runSubprocess = (
  command: string,
  args: string[],
  stdin: string,
  options: { env?: Record<string, string | undefined>; cwd?: string } = {},
) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...options.env },
      cwd: options.cwd,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(`Subprocess ${command} failed with exit code ${code}: ${stderr.slice(0, 2000)}`));
    });
    child.stdin.end(stdin);
  });
