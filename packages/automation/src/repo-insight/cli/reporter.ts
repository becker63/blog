import { CuratorDecision } from "../model/types";
import { ProjectCapsule } from "../model/types";
import { CapsuleCacheEvent } from "../cache/capsule-cache";
import { RepoPack } from "../packing/types";
import { RepoSelection } from "../packing/select-repos";
import { PollStateChange } from "../storage/poll-state";

export class Reporter {
  private readonly compact: boolean;

  constructor(options: { ci?: boolean } = {}) {
    this.compact = options.ci ?? process.env.CI === "true";
  }

  polling(context: { reposChecked: number; changes: PollStateChange[] }) {
    if (this.compact) {
      if (context.changes.length === 0) {
        this.log(`poll=no_changes count=${context.reposChecked}`);
        return;
      }
      this.log(`poll=repos_checked count=${context.reposChecked} changed=${context.changes.length}`);
      return;
    }

    const firstChange = context.changes[0];
    this.log(
      [
        "",
        "Polling",
        `  repos checked: ${context.reposChecked}`,
        `  changed repos: ${context.changes.length}`,
        ...(firstChange
          ? [
              `  last seen: ${firstChange.previous?.pushedAt ?? "never"}`,
              `  current: ${firstChange.repo.pushedAt}`,
            ]
          : []),
      ].join("\n"),
    );
  }

  selection(selection: RepoSelection) {
    if (this.compact) {
      this.log(
        `selection mode=${selection.mode} candidates=${selection.candidateRepos.length} selected=${selection.selectedRepos.length} changed=${selection.changedRepos.length} seed=${selection.randomSeed ?? "none"}`,
      );
      return;
    }

    this.log(
      [
        "",
        "Selection",
        `  mode: ${selection.mode}`,
        `  candidates: ${selection.candidateRepos.length}`,
        `  selected: ${selection.selectedRepos.length}`,
        `  changed repos: ${selection.changedRepos.length}`,
        `  seed: ${selection.randomSeed ?? "none"}`,
        "  selected repos:",
        ...selection.selectedRepos.map((repo) => `    - ${repo.fullName} pushedAt=${repo.pushedAt}`),
      ].join("\n"),
    );
  }

  budget(message: {
    kind: "producer" | "aggregator";
    status: "ok" | "exhausted";
    limit: number;
    used: number;
  }) {
    if (this.compact) {
      const label = message.kind === "aggregator" ? "aggregator" : "producerScheduled";
      this.log(`budget=${message.status} ${label}=${message.used}/${message.limit}`);
      return;
    }
    this.log(`\nBudget\n  kind: ${message.kind}\n  status: ${message.status}\n  used: ${message.used}\n  limit: ${message.limit}`);
  }

  producerBudgetLine(params: { scheduled: boolean; used: number; limit: number; exhausted?: boolean }) {
    if (!this.compact) {
      this.log(
        params.exhausted
          ? `\nBudget\n  exhausted: scheduled producer ${params.used}/${params.limit}`
          : params.scheduled
            ? `\nBudget\n  producer scheduled: ${params.used}/${params.limit}`
            : `\nBudget\n  manual run (scheduled quota not enforced)`,
      );
      return;
    }
    if (params.exhausted) {
      this.log(`budget=exhausted producerScheduled=${params.used}/${params.limit}`);
      return;
    }
    if (params.scheduled) {
      this.log(`budget=ok producerScheduled=${params.used}/${params.limit}`);
      return;
    }
    this.log("budget=skipped mode=manual producerQuota=not_applied");
  }

  packBudget(maxRepoBytes: number, maxTotalBytes: number) {
    this.log(
      this.compact
        ? `pack-budget maxRepoBytes=${maxRepoBytes} maxTotalBytes=${maxTotalBytes}`
        : `\nPack Budget\n  max repo bytes: ${maxRepoBytes}\n  max total bytes: ${maxTotalBytes}`,
    );
  }

  usageEstimate(usage: { inputTokens: number; outputTokens: number; model: string }) {
    this.log(
      this.compact
        ? `usage-estimate inputTokens≈${usage.inputTokens} outputTokens≈${usage.outputTokens} model=${usage.model}`
        : `\nUsage Estimate\n  input tokens: ≈${usage.inputTokens}\n  output tokens: ≈${usage.outputTokens}\n  model: ${usage.model}`,
    );
  }

  packs(packs: RepoPack[]) {
    if (this.compact) {
      const totalBytes = packs.reduce((sum, pack) => sum + pack.stats.byteCount, 0);
      const truncated = packs.filter((pack) => pack.stats.truncated).length;
      this.log(`packing=repomix repos=${packs.length} totalBytes=${totalBytes} truncatedRepos=${truncated}`);
      return;
    }
    this.log(
      [
        "",
        "Selected repos packed",
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

  capsuleCacheSummary(events: CapsuleCacheEvent[]) {
    const hits = events.filter((event) => event.hit).length;
    const skipped = events.filter((event) => event.skipped).length;
    const misses = events.filter((event) => !event.hit && !event.skipped).length;
    this.log(this.compact ? `capsule-cache hits=${hits} misses=${misses} skipped=${skipped}` : `\nCapsule cache\n  hits: ${hits}\n  misses: ${misses}\n  skipped compaction: ${skipped}`);
  }

  /** One line per repo outside CI; use capsuleCacheSummary for compact runs. */
  capsuleCache(events: CapsuleCacheEvent[]) {
    if (this.compact) {
      this.capsuleCacheSummary(events);
      return;
    }
    for (const event of events) {
      this.log(`capsule-cache repo=${event.repo} hit=${event.hit}${event.skipped ? " skipped=true" : ""}`);
    }
  }

  capsules(capsules: ProjectCapsule[], cacheEvents: CapsuleCacheEvent[] = []) {
    const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";
    const hits = cacheEvents.filter((event) => event.hit).length;
    const skipped = cacheEvents.filter((event) => event.skipped).length;
    const compactionMisses = cacheEvents.filter((event) => !event.hit && !event.skipped).length;
    this.log(
      this.compact
        ? `capsules=${capsules.length} model=${model} cacheHits=${hits} cacheMisses=${compactionMisses} skipped=${skipped}`
        : `\nCompaction\n  capsules generated: ${capsules.length}\n  model: ${model}\n  cache hits: ${hits}\n  cache misses: ${compactionMisses}\n  compaction skipped: ${skipped}`,
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

  aggregateContext(context: { writingSources: number; profileSources: number }) {
    this.log(
      this.compact
        ? `aggregate context writingSources=${context.writingSources} profileSources=${context.profileSources}`
        : `\nAggregate context\n  writing sources: ${context.writingSources}\n  profile sources: ${context.profileSources}`,
    );
  }

  private log(message: string) {
    console.log(message);
  }
}
