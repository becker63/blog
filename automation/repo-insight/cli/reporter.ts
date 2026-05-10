import { CuratorDecision, InsightRunTrigger } from "../model/types";
import { ProjectCapsule } from "../model/types";
import { CapsuleCacheEvent } from "../cache/capsule-cache";
import { RepoPack } from "../packing/types";
import { PollStateChange } from "../storage/poll-state";

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
        ? `trigger=${trigger.kind} repo=${trigger.repo}${trigger.pushedAt ? ` pushedAt=${trigger.pushedAt}` : ""}${trigger.after ? ` sha=${trigger.after}` : ""} changedFiles=${changedCount}`
        : [
            "Repo Insight",
            "",
            "Trigger",
            `  kind: ${trigger.kind}`,
            `  repo: ${trigger.repo}`,
            `  branch: ${trigger.branch ?? "unknown"}`,
            ...(trigger.pushedAt ? [`  pushed at: ${trigger.pushedAt}`] : []),
            `  range: ${range}`,
            `  changed files: ${changedCount}`,
            ...(trigger.note ? [`  note: ${trigger.note}`] : []),
          ].join("\n"),
    );
  }

  polling(context: { reposChecked: number; changes: PollStateChange[]; trigger?: InsightRunTrigger }) {
    if (this.compact) {
      if (context.changes.length === 0) {
        this.log(`poll=no_changes repos=${context.reposChecked}`);
        return;
      }
      this.log(`poll=repos_checked count=${context.reposChecked} changed=${context.changes.length}`);
      return;
    }

    const triggerRepo = context.trigger?.repo ?? "none";
    const firstChange = context.changes[0];
    this.log(
      [
        "",
        "Polling",
        `  repos checked: ${context.reposChecked}`,
        `  changed repos: ${context.changes.length}`,
        `  trigger: ${triggerRepo}`,
        ...(firstChange
          ? [
              `  last seen: ${firstChange.previous?.pushedAt ?? "never"}`,
              `  current: ${firstChange.repo.pushedAt}`,
            ]
          : []),
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

  capsuleCache(events: CapsuleCacheEvent[]) {
    for (const event of events) {
      this.log(`capsule-cache repo=${event.repo} hit=${event.hit}`);
    }
  }

  capsules(capsules: ProjectCapsule[], cacheEvents: CapsuleCacheEvent[] = []) {
    const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";
    const hits = cacheEvents.filter((event) => event.hit).length;
    const misses = cacheEvents.length - hits;
    this.log(
      this.compact
        ? `capsules=${capsules.length}`
        : `\nCompaction\n  capsules generated: ${capsules.length}\n  model: ${model}\n  cache hits: ${hits}\n  cache misses: ${misses}`,
    );
  }

  writingContext(context: { sourceCount: number; cacheHit: boolean }) {
    this.log(
      this.compact
        ? `writing-context sources=${context.sourceCount} cacheHit=${context.cacheHit}`
        : `\nWriting Context\n  sources: ${context.sourceCount}\n  cache hit: ${context.cacheHit}`,
    );
  }

  profileContext(context: { sourceCount: number; cacheHit: boolean }) {
    this.log(
      this.compact
        ? `profile-context sources=${context.sourceCount} cacheHit=${context.cacheHit}`
        : `\nAuthor Profile Context\n  sources: ${context.sourceCount}\n  cache hit: ${context.cacheHit}`,
    );
  }

  decision(decision: CuratorDecision) {
    if (decision.kind === "no_insight") {
      this.log(this.compact ? `decision=no_insight reason=${decision.reason}` : `\nDecision\n  no_insight: ${decision.reason}`);
      return;
    }
    this.log(
      this.compact
        ? `decision=insight title="${decision.issue.title}"`
        : `\nDecision\n  model: ${process.env.CURSOR_MODEL ?? "composer-2"}\n  insight: ${decision.issue.title}\n  confidence: ${decision.issue.confidence}`,
    );
  }

  output(output: { issueUrl?: string }) {
    if (this.compact) {
      this.log(`issue=${output.issueUrl ?? "none"}`);
      return;
    }
    this.log(["", "Output", `  issue: ${output.issueUrl ?? "none"}`].join("\n"));
  }

  private log(message: string) {
    console.log(message);
  }
}
