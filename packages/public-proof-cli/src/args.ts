export type CliArgs = {
  launch?: string;
  dryRun: boolean;
  persistDb?: boolean;
  confirm: boolean;
  only?: string;
  subreddit?: string;
};

export const parseCliArgs = (argv = process.argv.slice(2)): CliArgs => {
  const args: CliArgs = { dryRun: false, confirm: false };
  for (const arg of argv) {
    if (arg.startsWith("--launch=")) args.launch = arg.slice("--launch=".length);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--confirm") args.confirm = true;
    else if (arg === "--persist-db") args.persistDb = true;
    else if (arg.startsWith("--only=")) args.only = arg.slice("--only=".length);
    else if (arg.startsWith("--subreddit=")) args.subreddit = arg.slice("--subreddit=".length);
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: ${process.argv[1]} [--launch=id] [--dry-run] [--confirm] [--only=provider] [--subreddit=name]`);
      process.exit(0);
    }
  }
  return args;
};

export const requireLaunch = (args: CliArgs): string => {
  if (!args.launch) {
    throw new Error("--launch=<id> is required");
  }
  return args.launch;
};
