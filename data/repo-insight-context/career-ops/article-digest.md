# Article Digest — Proof Points

Compact proof points from public writing, portfolio projects, and major professional artifacts. Career-ops should use this file when matching job descriptions to evidence, generating tailored CV language, drafting cover letters, and preparing interview stories.

This file is not a resume. It is the evidence bank behind the resume.

---

## SearchBench — Agentic Code Search Evaluation Harness

**Links:**

* [https://github.com/becker63/searchbench](https://github.com/becker63/searchbench)
* [https://github.com/becker63/searchbench-go](https://github.com/becker63/searchbench-go)

**Hero signal:** Built a deterministic evaluation harness for agentic code-search systems with baseline-vs-candidate comparisons, static-graph scoring, token/cost tracking, telemetry, reproducible run bundles, and promotion-style reports.

**Core idea:** Agentic code-search systems should be evaluated like release candidates, not judged by one-off traces or vibes. SearchBench compares a baseline retrieval/search system against a candidate policy, runs localization tasks, scores the result, tracks cost, identifies regressions, and produces a report that answers whether the candidate should replace the baseline.

**Architecture / implementation notes:**

* Python harness with localizer/writer agents, backend adapters, localization runtime, static graph scoring, prompt templates, telemetry models, and tests.
* Go/Pkl surface for manifest-driven experiments, pure domain models, bundled artifacts, scoring objectives, report serialization, and promotion-style decisions.
* Compares systems such as jCodeMunch-style structured retrieval and Iterative Context-style candidate policies.
* Tracks more than final output: task identity, prediction, usage, score components, cost, traces, failures, regressions, and decision metadata.
* Uses deterministic scoring concepts such as gold-hop distance, issue-hop distance, token efficiency, reducers, and composite objectives.

**Proof points:**

* Demonstrates ability to design a full evaluation pipeline, not just a script.
* Shows taste for typed models, reproducible runs, deterministic scoring, and release boundaries.
* Bridges AI tooling with platform/release engineering: baseline, candidate, artifacts, score movement, regressions, and promotion decisions.
* Strongest single artifact for AI eval, LLMOps, developer tooling, and platform roles.

**Best used for roles involving:**

* AI evaluation infrastructure
* LLMOps / agent observability
* Developer tooling
* Code intelligence
* Agent infrastructure
* Platform engineering
* Release engineering for AI systems

**Resume / cover-letter phrasing:**

> Built SearchBench, a deterministic evaluation harness for agentic code-search systems that compares baseline and candidate retrieval policies using static-graph scoring, token/cost tracking, telemetry, reproducible run bundles, and promotion-style reports.

---

## AI Agents Need Release Reports, Not Just Traces

**Link:** [https://www.becker63.digital/Blogs/ai-release-reports](https://www.becker63.digital/Blogs/ai-release-reports)

**Hero signal:** Defined the product shape for release-quality AI evaluation: baseline, candidate, changed artifacts, score movement, regressions, protected cases, and promotion decisions.

**Core idea:** As agent systems become more like software systems, teams need more than traces and scores. They need release reports that explain whether a candidate system version should replace the current baseline and why.

**Key argument:**

* A trace tells you what happened.
* A score tells you how one dimension performed.
* A release report tells you whether a candidate system should ship.

**Proof points:**

* Shows ability to reason about AI systems as release-engineered software, not prompt experiments.
* Connects prompts, policies, tool schemas, retrieval strategies, runtime assumptions, scoring rules, and cost constraints into one change-management surface.
* Positions SearchBench as a concrete implementation of this release-report model for agentic code search.
* Demonstrates product sense around an underdeveloped AI tooling layer: candidate-vs-baseline decision artifacts.

**Best used for roles involving:**

* AI observability
* Agent evals
* Langfuse/LangSmith-adjacent tooling
* LLMOps
* AI platform reliability
* Technical product thinking for AI infrastructure

**Resume / cover-letter phrasing:**

> Published a technical essay arguing that agent systems need release reports, not just traces: baseline/candidate comparisons, changed artifacts, regressions, protected cases, and promotion rules for AI-system changes.

---

## Static Control Plane — Typed Infrastructure Modeling

**Link:** [https://github.com/becker63/designing-for-two](https://github.com/becker63/designing-for-two)

**Hero signal:** Modeled infrastructure with KCL, Crossplane, Buck2, Nix, generated schemas, and pytest validation to make deployment structure inspectable before runtime.

**Core idea:** Infrastructure configuration should be treated as a design-time reasoning surface, not just runtime YAML. Typed schemas, generated clients, reproducible tooling, and tests can surface impossible or fragile states before a cluster discovers them the hard way.

**Architecture / implementation notes:**

* KCL configurations for Kubernetes and Crossplane-managed resources.
* Crossplane compositions for DigitalOcean resources, DNS, droplets, and related infrastructure.
* FluxCD and Helm release configuration for control-plane components.
* Infisical secret modeling, Traefik ingress, and NixOS/FRPS configuration.
* Buck2 codegen rules for CRD-to-KCL, CRD-to-CloudCoil, and Go-schema-to-KCL workflows.
* pytest-based validation around generated resources and configuration structure.

**Proof points:**

* Shows practical platform engineering across Kubernetes, GitOps, typed configuration, secrets, ingress, and cloud resources.
* Demonstrates strong preference for pre-runtime validation and generated typed surfaces.
* Connects infrastructure work to the broader theme of shifting uncertainty earlier and making system shape inspectable.

**Best used for roles involving:**

* Platform engineering
* Kubernetes / Crossplane
* GitOps
* Typed infrastructure
* CI/CD
* Internal developer platforms
* Reproducibility and infrastructure testing

**Resume / cover-letter phrasing:**

> Built a typed static-control-plane experiment using KCL, Crossplane, Buck2, Nix, generated schemas, and pytest validation to model infrastructure before deployment.

---

## Asahi NixOS Workstation Platform — Apple Silicon Reproducibility and Packaging

**Link:** Personal infrastructure project; repo available on request.

**Hero signal:** Built and maintain a flake-based NixOS workstation on Apple Silicon/Asahi Linux, using overlays, wrappers, pinned dependencies, and hardware-specific configuration to make a nonstandard developer machine reproducible and inspectable.

**Core idea:** A personal workstation can be treated like a real platform surface. Instead of allowing configuration drift to accumulate across shell state, package installs, desktop settings, and hardware quirks, the machine is modeled as a reproducible system with explicit package composition, environment wiring, and architecture-specific constraints.

**Architecture / implementation notes:**

* Flake-based NixOS + Home Manager configuration for system packages, user environment, and developer tooling.
* Asahi Linux / Apple Silicon-specific hardware enablement, including firmware integration, graphics/audio/session settings, and Wayland-oriented desktop defaults.
* Custom overlays and package definitions for local tooling, desktop wrappers, scripts, and architecture-aware packaging paths.
* Explicit handling for runtime/library issues around Mesa, GPU acceleration, Electron apps, and aarch64 Linux compatibility.
* Custom shell/tooling environment composition for Xonsh, Python, Zed variants, terminal setup, and supporting developer workflows.

**Proof points:**

* Shows hands-on Nix/flakes ownership beyond "I use Nix for dev shells" level.
* Demonstrates packaging and runtime debugging on a non-default architecture with real hardware constraints.
* Strong evidence for deployment thinking: explicit dependency surfaces, pinned versions, wrappers, runtime environment control, and reproducible rebuilds.
* Useful bridge artifact for roles that care about developer environments, platform legibility, internal tooling, workstation/platform standardization, or deployment safety.

**Best used for roles involving:**

* Deployment engineering
* Platform engineering
* Nix / NixOS
* Linux platform ownership
* Developer environment infrastructure
* Packaging / release engineering
* Apple Silicon / ARM Linux enablement

**Resume / cover-letter phrasing:**

> Built and maintain a flake-based NixOS workstation on a MacBook M2 running Asahi Linux, using overlays, wrappers, pinned dependencies, and hardware-specific configuration to make Apple Silicon developer infrastructure reproducible and inspectable.

---

## libnftnl / netfilter Structured Fuzzer

**Link:** [https://github.com/becker63/nftables-structure-fuzzer](https://github.com/becker63/nftables-structure-fuzzer)

**Hero signal:** Built a Nim/Nix structure-aware fuzzing harness around Linux firewall userland compilation, libnftnl object construction, and Netlink serialization boundaries.

**Core idea:** Security-relevant behavior often lives at semantic boundaries, not just in obvious memory-corruption surfaces. The nftables stack has a critical lowering path from human policy to userland objects to Netlink messages to kernel validation. A structure-aware fuzzer can explore that lowering boundary more meaningfully than raw byte mutation.

**Architecture / implementation notes:**

* Nim wrappers around libnftnl and Linux/netfilter headers.
* RAII-style wrappers over C pointers and libnftnl object lifetimes.
* Protobuf-shaped mutation inputs mapped into nftables tables, chains, rules, and expression variants.
* Expression construction for payload, cmp, meta, bitwise, immediate, counter, conntrack, limit, quota, and related forms.
* Serialization paths for producing Netlink messages from structured fuzz inputs.
* Nix-based reproducible fuzzing environment with containers, MicroVM-oriented runtime pieces, sanitizer/coverage support, metrics exporter, Prometheus, and Grafana.

**Proof points:**

* Demonstrates low-level systems ability without pretending to be a kernel specialist.
* Shows ability to wrap unsafe C interfaces in safer typed surfaces.
* Reveals strong intuition for security seams: userland compilation, serialization, kernel validation, policy semantics, and authority boundaries.
* Strong evidence for infrastructure security, Linux systems, networking, and security tooling roles.

**Best used for roles involving:**

* Security engineering
* Linux systems
* Networking infrastructure
* Fuzzing
* Low-level systems tooling
* Policy engines / firewalls
* Reproducible security research

**Resume / cover-letter phrasing:**

> Built a structure-aware Nim/Nix fuzzing harness for libnftnl/netfilter, wrapping C APIs in typed interfaces and generating serialized nftables objects to explore Linux firewall semantic and serialization boundaries.

---

## The Firewall Doesn’t Live in the Kernel

**Link:** [https://www.becker63.digital/Blogs/the-firewall-doesnt-live-in-the-kernel](https://www.becker63.digital/Blogs/the-firewall-doesnt-live-in-the-kernel)

**Hero signal:** Traced Linux firewall semantics from human policy through nftables, libnftnl, Netlink, kernel validation, and packet-time execution; framed semantic authority as a security boundary.

**Core idea:** The packet filter executes in the kernel, but much of the semantic authority lives in privileged userland before rules ever reach the kernel. That lowering path matters because policy confusion, defaults, normalization, and representation mismatches can be security-relevant even without memory corruption.

**Key argument:**

* The kernel enforces what it receives; it does not reinterpret operator intent.
* Userland tooling parses, normalizes, expands, and serializes policy before kernel validation.
* Semantic authority is therefore a security boundary.

**Proof points:**

* Shows ability to map a complex layered system end-to-end.
* Uses concrete code and object/lifetime analysis rather than hand-wavy security commentary.
* Connects the fuzzer project to a clear systems-security research question.
* Demonstrates communication depth for senior engineers who value precise mental models.

**Best used for roles involving:**

* Infrastructure security
* Linux/networking systems
* Security research
* Policy engines
* Technical writing
* Systems debugging

**Resume / cover-letter phrasing:**

> Published a systems-security essay tracing Linux firewall semantics across nftables, libnftnl, Netlink, kernel validation, and packet-time execution, arguing that semantic authority is itself a security boundary.

---

## Deterministic Context Compiler Visualization

**Link:** [https://github.com/becker63/sat](https://github.com/becker63/sat)

**Hero signal:** Designed a React Flow demo showing token-bounded graph expansion, constraint-based context selection, and explainable refinement for code reasoning.

**Core idea:** Code context for AI agents should be selected as a deterministic graph/constraint problem, not as arbitrary top-K retrieval. A system should be able to explain why each context node was included, what constraint caused expansion, and why it stopped.

**Architecture / implementation notes:**

* Next.js + React Flow + Framer Motion interface.
* Graph event protocol for solver-visible changes.
* Animated nodes/edges for anchors, expansions, in-context selections, and learned constraints.
* Token pane for showing context budget and savings.
* Search scope controls and playback state.
* Reducer/test structure for deterministic graph event behavior.

**Proof points:**

* Shows product sense around making AI retrieval decisions visible.
* Demonstrates frontend systems skill: graph layout, animation, event streams, state management, and explainable UI.
* Connects directly to SearchBench and the larger agentic code-search/evaluation narrative.

**Best used for roles involving:**

* AI developer tools
* Code intelligence
* Context engineering
* Graph UIs
* Frontend systems
* Explainability / observability interfaces

**Resume / cover-letter phrasing:**

> Designed and prototyped a React Flow visualization for deterministic context selection, showing token-bounded graph expansion, constraint-based refinement, and explainable context inclusion for AI code-search workflows.

---

## Technical Writing Platform

**Link:** [https://github.com/becker63/blog](https://github.com/becker63/blog)

**Hero signal:** Built a custom MDX/Next.js portfolio for systems essays with static diagrams, search/tree navigation, and layout tests.

**Core idea:** The blog is not just a publishing surface; it is a controlled technical artifact for communicating systems research clearly. It supports long-form essays, diagrams, search/navigation, and layout reliability.

**Architecture / implementation notes:**

* Next.js / MDX blog with typed post metadata.
* Static Mermaid rendering for diagrams.
* Search/tree navigation for post discovery.
* Reusable UI components and custom layout styling.
* Tests for layout, mobile navbar behavior, SVG visibility, and tree-line continuity.

**Proof points:**

* Shows the ability to build and maintain a public technical artifact surface.
* Demonstrates care for presentation, reading experience, and documentation infrastructure.
* Supports a portfolio strategy based on public technical reasoning instead of credential-only signaling.

**Best used for roles involving:**

* Technical communication
* Developer education
* Documentation systems
* Frontend/platform crossover
* Internal enablement
* DevRel-adjacent engineering

**Resume / cover-letter phrasing:**

> Built and maintain a custom Next.js/MDX technical writing platform with static diagrams, search/tree navigation, and layout tests for publishing systems essays.

---

## Ohio Supercomputer Center — Systems Documentation and Security Work

**Link:** Internal/professional experience; no public repo.

**Hero signal:** Reverse-engineered complex HPC web-platform behavior across application code, deployment, auth/proxy layers, CI, runtime assumptions, and local reproduction.

**Core idea:** The role became a systems translation function across a large, Unix-centric, production-adjacent HPC platform. The work involved making implicit architecture explicit: how auth, proxying, deployment, local reproduction, CI, and runtime assumptions actually fit together.

**Proof points:**

* Traced real code paths across application logic, deployment scripts, runtime behavior, CI behavior, proxy layers, and auth boundaries.
* Produced code-path-driven documentation for a complex HPC web platform.
* Reproduced production-adjacent behavior locally with Docker-based development environments.
* Investigated CI flakiness and environment drift; explored Nix/asdf-style reproducibility improvements.
* Traced auth and authorization behavior across Apache, Nginx, Rails, Lua, OIDC/LDAP-related glue, and upstream-header trust boundaries.
* Designed end-to-end security testing strategy for auth/proxy behavior.
* Identified double URL encoding behavior with RCE-adjacent implications.

**Best used for roles involving:**

* Platform engineering
* Infrastructure debugging
* Security engineering
* Auth/IAM
* Reproducibility
* Technical documentation
* Brownfield systems comprehension

**Resume / cover-letter phrasing:**

> At OSC, reverse-engineered production-adjacent HPC platform behavior across application code, auth/proxy layers, deployment, CI, and runtime assumptions; produced code-path-driven documentation and local Docker reproduction environments.

---

## Tarigma / GE Vernova — Electrical Grid Incident Response UI

**Link:** Professional experience; no public repo.

**Hero signal:** Owned complex frontend state coordination for operator-facing electrical-grid incident-response software, including Recoil/react-mosaic workspace state and Chart.js temporal annotation behavior.

**Core idea:** The frontend was not just a visual layer. It was an operational surface for temporal coordination under stress. Operators needed to anchor themselves in time and space while analyzing unfolding grid events.

**Proof points:**

* Owned integration between Recoil state management and react-mosaic windowed layouts.
* Coordinated dynamic panes, live data, focus changes, window lifecycle, layout restoration, and asynchronous updates.
* Treated UI state synchronization as a distributed coordination problem.
* Maintained a custom Chart.js fork to support draggable temporal annotations.
* Extended existing chart annotation behavior surgically instead of replacing the subsystem.
* Used animation/interpolation to preserve operator trust and temporal continuity when computed anchors changed.

**Best used for roles involving:**

* Frontend systems
* Visualization
* Operator tooling
* Human-in-the-loop systems
* Complex state management
* Technical product surfaces

**Resume / cover-letter phrasing:**

> At Tarigma/GE Vernova, owned complex frontend state coordination for electrical-grid incident response software, including Recoil/react-mosaic operator workspaces and custom Chart.js temporal annotation behavior.

---

## STEMTree — Programming Instruction and Technical Operations

**Link:** Professional experience; no public repo.

**Hero signal:** Taught programming and STEM concepts while handling practical technical operations for an after-school learning environment.

**Core idea:** STEMTree is strongest as evidence for teaching, communication, human factors, and practical operational responsibility. It should be used selectively so it supports rather than dilutes the technical narrative.

**Proof points:**

* Taught Python, web concepts, electronics, and physics.
* Adapted pacing for struggling students and high-aptitude learners.
* Guided one student from zero to React over roughly one year.
* Managed student laptops and classroom device readiness.
* Configured Raspberry Pi / Pi-hole and network/router settings to block inappropriate content at the network layer.
* Served as parent-facing contact and handled classroom/facility continuity.

**Best used for roles involving:**

* Technical education
* Developer enablement
* Customer-facing technical explanation
* Documentation
* Solutions engineering
* Human factors in systems work

**Resume / cover-letter phrasing:**

> Taught programming and STEM concepts while managing local technical operations, including student devices and network-level safety guardrails.

---

## Cross-Artifact Themes

Career-ops should look for these themes across jobs and select proof points accordingly.

### Theme: Shift uncertainty earlier

Use when a JD mentions testing, validation, CI/CD, reliability, evals, release gates, static analysis, typed configs, or reproducibility.

**Evidence:** SearchBench, Static Control Plane, libnftnl fuzzer, AI release reports essay.

**Phrase:**

> I tend to move expensive runtime discovery into earlier, cheaper, inspectable phases.

### Theme: Make hidden system behavior legible

Use when a JD mentions observability, debugging, infrastructure, operations, support escalation, incident response, or complex systems.

**Evidence:** OSC, Tarigma, SearchBench, Technical Writing Platform, firewall essay.

**Phrase:**

> My strongest work is at seams where a system works because people compensate for what the tooling does not make explicit.

### Theme: Translate across layers without flattening

Use when a JD mentions customer-facing engineering, solutions, field engineering, documentation, DevRel, enablement, or cross-functional work.

**Evidence:** OSC, Tarigma, STEMTree, technical essays, blog platform.

**Phrase:**

> I can explain complex system behavior in a way that remains accurate enough for engineers and usable enough for non-specialists.

### Theme: Release-quality AI systems

Use when a JD mentions AI agents, evals, observability, LLMOps, traces, prompt management, tool use, retrieval, code agents, or model quality.

**Evidence:** SearchBench, AI release reports essay, deterministic context compiler visualization.

**Phrase:**

> I think agent systems need release boundaries: baseline/candidate comparisons, regressions, protected cases, and promotion rules, not only traces and scores.

### Theme: Security at semantic boundaries

Use when a JD mentions auth, policy, IAM, proxies, networking, firewalls, secure infrastructure, or security testing.

**Evidence:** OSC, libnftnl fuzzer, firewall essay, Security+/Network+, CTF recognition.

**Phrase:**

> My security instincts focus on semantic seams: places where one layer trusts another layer’s interpretation of intent.

---

## Usage Guidance for career-ops

* For **AI infra / eval roles**, lead with SearchBench, AI release reports, and the deterministic context compiler visualization.
* For **platform roles**, lead with SearchBench, OSC, Static Control Plane, and reproducibility work.
* For **security roles**, lead with OSC, libnftnl fuzzer, firewall essay, certifications, and CTF recognition.
* For **frontend systems / visualization roles**, lead with Tarigma, deterministic context compiler visualization, and the blog platform.
* For **technical solutions / forward deployed roles**, lead with OSC, Tarigma, STEMTree, and technical writing.
* Avoid leading with STEMTree unless the role explicitly values teaching, enablement, customer explanation, or human factors.
* Avoid over-explaining the philosophical identity behind the work. Let the artifacts carry the signal.
