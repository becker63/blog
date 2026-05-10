import { CuratorDecision, InsightRunTrigger } from "../model/types";
import { ProjectCapsule } from "../model/types";
import { RepoPack } from "../packing/types";

export class Reporter {
  private readonly compact: boolean;

  constructor(options: { ci?: boolean } = {}) {
    this.compact = options.ci ?? process.env.CI === "true";
  }

  trigger(trigger: InsightRunTrigger) {
    const changedCount = trigger.changedFiles?.length ?? 0;
    const range = trigger.before && trigger.after ? `${trigger.before} -> ${trigger.after}` : "inferred from pushed_at";
    this.log(
      this.compact
        ? `trigger=${trigger.kind} repo=${trigger.repo}${trigger.after ? ` sha=${trigger.after}` : ""} changedFiles=${changedCount}`
        : [
            "Repo Insight",
            "",
            "Trigger",
            `  kind: ${trigger.kind}`,
            `  repo: ${trigger.repo}`,
            `  branch: ${trigger.branch ?? "unknown"}`,
            `  range: ${range}`,
            `  changed files: ${changedCount}`,
            ...(trigger.note ? [`  note: ${trigger.note}`] : []),
          ].join("\n"),
    );
  }

  packs(packs: RepoPack[]) {
    if (this.compact) {
      this.log(`packing=repomix repos=${packs.length}`);
      for (const pack of packs) {
        this.log(`pack repo=${pack.fullName} bytes=${pack.stats.byteCount} truncated=${pack.stats.truncated}`);
      }
      return;
    }
    this.log(
      [
        "",
        "Top repos packed",
        "  packing tool: repomix",
        `  compressed: true`,
        `  output style: ${packs[0]?.style ?? process.env.REPO_INSIGHT_PACK_STYLE ?? "xml"}`,
        ...packs.map(
          (pack, index) =>
            `  ${index + 1}. ${pack.fullName}, pushedAt=${pack.pushedAt}, files=${pack.stats.includedFileCount}, bytes=${pack.stats.byteCount}, truncated=${pack.stats.truncated}`,
        ),
      ].join("\n"),
    );
  }

  capsules(capsules: ProjectCapsule[]) {
    const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";
    this.log(
      this.compact
        ? `capsules=${capsules.length}`
        : `\nCompaction\n  capsules generated: ${capsules.length}\n  model: ${model}`,
    );
  }

  decision(decision: CuratorDecision) {
    if (decision.kind === "no_insight") {
      this.log(this.compact ? `decision=no_insight reason=${decision.reason}` : `\nDecision\n  no_insight: ${decision.reason}`);
      return;
    }
    this.log(
      this.compact
        ? `decision=insight title="${decision.artifact.frontmatter.title}"`
        : `\nDecision\n  model: ${process.env.CURSOR_MODEL ?? "composer-2"}\n  insight: ${decision.artifact.frontmatter.title}\n  confidence: ${decision.artifact.frontmatter.confidence}`,
    );
  }

  output(output: { artifactPath?: string; issueUrl?: string }) {
    if (this.compact) {
      this.log(`artifact=${output.artifactPath ?? "none"} issue=${output.issueUrl ?? "none"}`);
      return;
    }
    this.log(["", "Output", `  artifact: ${output.artifactPath ?? "none"}`, `  issue: ${output.issueUrl ?? "none"}`].join("\n"));
  }

  private log(message: string) {
    console.log(message);
  }
}
