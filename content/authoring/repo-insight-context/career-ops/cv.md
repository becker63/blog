# CV — Taylor Johnson

**Location:** New Albany, Ohio, USA
**Email:** [[redacted-email]](mailto:[redacted-email])
**LinkedIn:** [https://www.linkedin.com/in/taylor-johnson-805061210/](https://www.linkedin.com/in/taylor-johnson-805061210/)
**GitHub:** [https://github.com/becker63](https://github.com/becker63)
**Portfolio:** becker63.digital

## Professional Summary

Infrastructure, security, and developer tooling engineer focused on making complex systems legible, reproducible, and safer to operate. Experienced across HPC infrastructure, electrical grid incident-response software, Linux/networking research, typed infrastructure modeling, and AI evaluation tooling. Strongest in cross-cutting systems work: tracing behavior across UI state, auth boundaries, deployment environments, control planes, runtime artifacts, and human workflows.

I build tools that move uncertainty out of people’s heads and into inspectable artifacts: static graphs, typed configs, reproducible environments, fuzzing harnesses, telemetry traces, run bundles, and release-style reports.

## Target Roles

Platform Engineer · Infrastructure Engineer · Developer Tooling Engineer · Security Engineer · AI Evaluation Engineer · AI Platform / LLMOps Engineer · Forward Deployed Engineer · Technical Solutions Engineer

## Core Strengths

* Reverse-engineering opaque systems into clear operating models
* Building reproducible local environments for systems that are hard to reason about directly
* Tracing correctness and security problems across auth, proxying, deployment, serialization, UI state, and runtime boundaries
* Designing typed, testable interfaces over fragile configuration or infrastructure surfaces
* Writing technical artifacts that explain complex system behavior without flattening important details
* Reducing operational ambiguity through observability, structured evaluation, and deterministic feedback loops

## Technical Skills

**Languages:** Python, Go, TypeScript, JavaScript, Nim, Bash, SQL, KCL, Nix
**Infrastructure:** Linux, Docker, Nix / NixOS, Kubernetes, Crossplane, FluxCD, Helm, Traefik, Buck2, CI/CD, GitOps
**Security & Systems:** IAM, auth flows, reverse proxies, Apache, Nginx, Lua, URL encoding boundaries, Linux networking, nftables, libnftnl, libmnl, fuzzing, sanitizer instrumentation
**AI / Evaluation Tooling:** agentic code search, LLM eval harnesses, static graph scoring, token/cost tracking, baseline-vs-candidate comparison, Langfuse-style telemetry, MCP-style tool interfaces
**Frontend / Visualization:** React, Next.js, TypeScript, Recoil, react-mosaic, Chart.js, React Flow, Framer Motion, MDX
**Testing & Quality:** pytest, Playwright, Vitest, basedpyright, ruff, structured fixtures, reproducible dev shells, model/API test doubles
**Documentation:** architecture docs, runbooks, evaluation reports, technical essays, source-of-truth diagrams, code-path-driven explanations

## Selected Projects

### SearchBench — Agentic Code Search Evaluation Harness

**Python / Go / Pkl / Langfuse-style telemetry / static graphs / LLM tooling**
**Repo:** https://github.com/becker63/searchbench https://github.com/becker63/searchbench-go

Built a deterministic evaluation harness for agentic code-search systems. SearchBench compares baseline structured retrieval against candidate retrieval policies, evaluates localization quality, tracks token/cost usage, emits telemetry, and produces release-style candidate reports.

* Built a Python harness with localizer/writer agents, backend adapters, localization runtime, scoring modules, telemetry models, prompt templates, and a large test suite.
* Modeled bug-localization tasks as typed data flowing through canonical task, prediction, run-result, evaluation-result, and scoring objects.
* Added static-graph scoring concepts such as gold-hop distance, issue-hop distance, token efficiency, reducers, and score summaries.
* Integrated observability and cost tracking so runs can be analyzed by score, token usage, provider usage, and failure category rather than by vibes.
* Reworked the project into a Go/Pkl experiment surface with manifest-driven experiments, pure domain models, bundled run artifacts, scoring objectives, report serialization, and promotion-style decisions.
* Designed the product shape around a release-engineering question: whether a candidate agent/search policy should replace the current baseline.

**Best evidence for:** AI evaluation infrastructure, developer tooling, platform engineering, reproducible experiments, LLMOps, release engineering for agent systems.

### Static Control Plane — Typed Infrastructure Modeling

**KCL / Crossplane / Buck2 / Nix / FluxCD / Kubernetes / DigitalOcean / Infisical / Traefik**
**Repo:** https://github.com/becker63/designing-for-two

Built a typed infrastructure modeling experiment that treats configuration as a pre-runtime reasoning surface rather than a bag of YAML.

* Modeled Crossplane-managed infrastructure using KCL configurations, generated schemas, and typed resource definitions.
* Built control-plane resources for FluxCD, Helm releases, Infisical-managed secrets, Traefik ingress, DigitalOcean DNS/droplets, and NixOS FRPS configuration.
* Used Buck2 rules and codegen tooling to generate Python/KCL schema surfaces from CRDs and Go schema inputs.
* Added pytest-based validation around generated resources and configuration shape.
* Explored how design-time structure can catch impossible or fragile infrastructure states before a cluster has to discover them at runtime.

**Best evidence for:** platform engineering, typed infrastructure, GitOps, Kubernetes ecosystem, reproducibility, CI/CD, infrastructure testing.

### Asahi NixOS Workstation Platform — Apple Silicon Reproducibility and Packaging

**Nix / NixOS / flakes / Home Manager / Asahi Linux / Apple Silicon / overlays / Wayland**

Built and maintain a flake-based NixOS workstation on a MacBook M2 running Asahi Linux, treating the laptop as a real platform surface rather than an ad hoc personal setup.

* Unified system configuration, user environment, firmware integration, and per-tool settings under a single flake so the machine can be rebuilt reproducibly instead of managed by drift.
* Integrated Apple Silicon and Asahi-specific hardware enablement, graphics/audio/session configuration, Wayland defaults, and input/display tuning for a daily-driver developer environment.
* Wrote custom overlays, wrappers, and package definitions for local tooling and desktop apps, including Python/Xonsh environments, helper scripts, Zed launch variants, and Electron packaging for aarch64 Linux.
* Used pinned dependencies, runtime wrappers, and explicit environment settings to reduce breakage around Mesa, GPU acceleration, desktop packaging, and architecture-specific runtime behavior.
* Treated the machine as a deployment/debugging target: making system state, package composition, and workstation behavior inspectable through Nix rather than hand-edited shell history.

**Best evidence for:** deployment engineering, Nix / flakes, Linux platform ownership, reproducibility, Apple Silicon enablement, packaging, brownfield systems debugging.

### libnftnl / netfilter Structured Fuzzer

**Nim / Nix / C libraries / libnftnl / libmnl / protobuf mutation / MicroVMs / Prometheus / Grafana**
**Repo:** https://github.com/becker63/nftables-structure-fuzzer

Built a structure-aware fuzzing harness for nftables userland serialization paths, focused on the seam where firewall policy is lowered into libnftnl objects and Netlink messages.

* Wrapped libnftnl and Linux/netfilter headers with generated Nim bindings and RAII-style wrappers over C pointers.
* Modeled nftables tables, chains, rules, and expressions as structured mutation targets instead of raw byte streams.
* Implemented protobuf-to-libnftnl mapping layers for expression variants such as payload, cmp, meta, bitwise, immediate, counter, conntrack, limit, and quota.
* Built serialization paths that generate Netlink messages from structured fuzz inputs.
* Designed reproducible Nix-based fuzzing infrastructure with instrumented library builds, sanitizer/coverage support, containers, MicroVM isolation, process orchestration, Prometheus metrics, and Grafana dashboards.
* Used the project to analyze semantic authority across nftables frontends, libnftables/libnftnl, Netlink serialization, kernel validation, and packet-time execution.

**Best evidence for:** security engineering, systems programming, Linux networking, fuzzing, low-level interface design, reproducible security research.

### Deterministic Context Compiler Visualization

**Next.js / React Flow / Framer Motion / RxJS / Jotai / graph events / token budgeting**
**Repo:** https://github.com/becker63/sat

Designed and prototyped a visualization for deterministic context selection in AI code-search workflows.

* Modeled code context as a constraint/optimization problem: query anchors, deterministic graph expansion, token-bounded packing, missing-symbol refinement, and stabilized answer.
* Built graph event models, reducer logic, playback state, token panes, animated graph nodes/edges, search scope controls, and UI tests.
* Used React Flow and Framer Motion to show graph expansion, solver iterations, token budget changes, and refinement decisions as visible system behavior.
* Framed the demo around explainable failure modes: budget exhaustion, missing anchors, missing definitions, or depth limits.
* Designed the interface to communicate why a context bundle was selected, not just what text was returned.

**Best evidence for:** AI developer tools, graph UI, frontend systems, explainability, context engineering, product-minded infrastructure.

### Technical Writing Platform

**Next.js / MDX / static Mermaid rendering / Panda CSS / Playwright tests**
**Repo:** https://github.com/becker63/blog

Built and maintain a custom technical publishing site for long-form systems essays.

* Built a Next.js / MDX blog with typed post metadata, custom layouts, search/tree navigation, reusable UI components, and static Mermaid diagram rendering.
* Added layout and visual consistency tests covering mobile behavior, navbar overlap, SVG visibility, and tree-line continuity.
* Published essays on AI release reports, Linux firewall semantic boundaries, control planes, tight feedback loops, and designing interfaces for multiple audiences.
* Use the site as an artifact surface for communicating complex infrastructure research to engineers.

**Best evidence for:** technical communication, developer education, docs systems, frontend/platform crossover, public engineering taste.

## Work Experience

### Ohio Supercomputer Center — Security & Infrastructure Documentation Intern

**Columbus, OH · Oct 2024 – Nov 2025**

Worked in a security/infrastructure documentation role that became a systems translation role across auth, deployment, runtime behavior, local reproduction, and developer-facing documentation.

* Reverse-engineered end-to-end architecture by tracing real code paths across application logic, deployment scripts, runtime behavior, CI behavior, proxy layers, and auth boundaries.
* Produced code-path-driven documentation for a complex HPC web platform exposing Unix-centric workflows through a browser-based control plane.
* Reproduced production-adjacent behavior locally with Docker-based development environments, enabling reasoning and debugging without production access.
* Investigated CI flakiness and environment drift; explored Nix and asdf-based approaches for more reproducible dependency management.
* Traced authentication and authorization behavior across Apache, Nginx, Rails, Lua, OIDC/LDAP-related glue, and upstream-header trust boundaries.
* Designed end-to-end security testing strategy for auth/proxy behavior and identified double-URL-encoding behavior with RCE-adjacent implications.
* Documented hidden operational assumptions and cross-cutting concerns that were otherwise distributed across code, deployment scripts, and institutional memory.

**Primary signal:** infrastructure comprehension under uncertainty; reproducibility; auth/security boundary tracing; documentation as operational tooling.

### Tarigma / GE Vernova — Systems-Oriented Frontend Engineer

**Remote / Hybrid · 2021 – 2023**

Worked on electrical-grid incident response software where the frontend served as an operational surface for understanding time-sensitive grid events.

* Owned architectural integration between Recoil state management and react-mosaic windowed layouts for complex operator workspaces.
* Built and maintained UI state coordination across dynamic panes, live data, focus changes, window lifecycle, layout restoration, and asynchronous updates.
* Treated the frontend as a distributed coordination system: preserving operator trust under timing, partial-update, and state-synchronization constraints.
* Maintained a custom Chart.js fork to support draggable temporal annotations for an Oscillograph-style dashboard.
* Extended existing chart annotation behavior surgically rather than replacing the subsystem, preserving maintainability and future legibility.
* Used interpolation/animation to preserve temporal continuity and avoid breaking an operator’s sense of causality when computed time anchors changed.
* Participated in startup-style product and architecture discussions, including how technical debt, cognitive interfaces, and demo-driven architecture affected product risk.

**Primary signal:** frontend systems engineering; state synchronization; human/operator cognition; temporal interfaces; restrained platform taste.

### STEMTree — Programming Instructor / Technical Operations

**Ohio · 2021 – 2023**

Taught programming and STEM concepts while also handling local technical operations for an after-school learning environment.

* Taught Python, JavaScript, React, and CS concepts to students ages 10–16 with varied ability levels.
* Adapted pacing and curriculum for both struggling students and high-aptitude learners, including guiding one student from zero to React over roughly a year.
* Focused instruction on how to think through uncertainty rather than rote completion.
* Managed student laptops and local device readiness for classroom use.
* Configured a Raspberry Pi / Pi-hole setup and modified network/router settings to block inappropriate content at the network layer.
* Served as a primary parent-facing contact during pickup and handled classroom management, emotional regulation, facility closing, and day-to-day operational continuity.

**Primary signal:** technical teaching, human interface design, early operations ownership, practical infrastructure guardrails.

### OfficeMax — Customer Operations Associate

**Ohio · Dates TODO**

Current holdover role focused on customer-facing communication, task switching, and practical social compression while continuing technical project and job-search work.

* Handle customer needs in a retail operations environment requiring fast context-switching, clear communication, and calm prioritization.
* Practice compressing technical and practical explanations for non-technical audiences.
* Maintain reliability and workplace coordination while pursuing infrastructure/platform roles.

**Primary signal:** communication under pressure, customer interface, humility, current employment continuity.

## Technical Writing

### AI Agents Need Release Reports, Not Just Traces

Argues that agent systems need release-engineering boundaries: baseline, candidate, changed artifacts, score movement, regressions, protected cases, and promotion decisions. Connects SearchBench to a broader need for AI-system release reports rather than isolated traces or scores.

### The Firewall Doesn’t Live in the Kernel

Traces Linux firewall behavior from human intent through nftables configuration, userland compilation, libnftnl object construction, Netlink serialization, kernel validation, and packet-time execution. Frames semantic authority as a security boundary and explains why policy confusion can matter even without memory corruption.

### Designing for Two

Explores interface design for multiple audiences and authority levels, emphasizing explicit surfaces, typed boundaries, and the separation between power and authority in technical systems.

### Tight Loops

Explores feedback loops, instrumentation, and how development environments shape the speed and quality of reasoning.

### Two Times I Didn’t Build a Platform

Uses game-server infrastructure vignettes to show restraint: container diffing for user configuration and OpenWrt/pfSense port-forwarding instead of overbuilt networking abstractions.

## Professional Engagement & Recognition

* Active participant in Central Ohio engineering and consulting communities, with conversations around platform engineering, infrastructure reliability, security, reproducible development environments, and AI tooling.
* US Cyber Challenge Cyber Camp, 2025 — selected participant in multi-day cybersecurity training and CTF-style competition.
* PicoCTF, Carnegie Mellon University, 2024 — placed 57th of 1,329 teams.
* SkillsUSA Cybersecurity, State Competition — Second Place.

## Education & Certifications

**Computer Science Coursework** — The Ohio State University, Newark
**Cybersecurity Program** — Eastland-Fairfield Career & Technical Schools

**Certifications:** CompTIA Security+ · CompTIA Network+ · TestOut Network Pro

## Resume Positioning Notes for career-ops

Use this CV as the source of truth for technical matching. For most roles, lead with SearchBench and OSC. Use Tarigma when the role values UI systems, operator workflows, observability, or time/space/state reasoning. Use the libnftnl fuzzer for security, Linux, networking, or low-level systems roles. Use Static Control Plane for platform, Kubernetes, GitOps, typed infrastructure, and reproducibility roles. Use the Asahi NixOS workstation project for Nix, flakes, Apple Silicon, packaging, deployment safety, Linux platform ownership, and reproducible-environment roles. Use STEMTree only when teaching, documentation, enablement, customer-facing explanation, or human factors are relevant.
