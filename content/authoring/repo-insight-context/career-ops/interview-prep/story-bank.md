# Story Bank — Master STAR+R Stories

This file contains reusable STAR+R stories for interviews. Each story is intentionally written as a flexible master story, not a memorized script.

Use these stories to answer:

* "Tell me about yourself"
* "Tell me about your most impactful project"
* "Tell me about a time you dealt with ambiguity"
* "Tell me about a conflict or disagreement"
* "Tell me about a technical decision"
* "Tell me about a time you learned something hard"
* "Why are you interested in this role?"
* "Why should we hire you despite a non-traditional path?"

The goal is to maintain 5-10 deep stories that can bend to many questions instead of memorizing dozens of shallow answers.

---

## How to use this bank

### The Big Three

**Tell me about yourself**
Use a 3-story arc:

1. Tarigma — learned that UI can be a systems correctness surface.
2. OSC — learned to trace and reproduce opaque infrastructure systems.
3. SearchBench — turned that instinct into a modern AI/devtools evaluation harness.

**Tell me about your most impactful project**
Default to **SearchBench** for AI/devtools/platform roles.
Default to **OSC local reproducibility/auth tracing** for platform/security roles.
Default to **Tarigma operator workspace** for frontend systems/visualization roles.

**Tell me about a conflict or hard environment**
Use **OSC reproducibility / cross-cutting complexity**, but keep it professional: disagreement over dependency management and environment drift, not personal grievance.

---

## Story Selection Map

| Role / Interview Theme    | Best Story                            | Backup Story                                 |
| ------------------------- | ------------------------------------- | -------------------------------------------- |
| AI eval / LLMOps          | SearchBench candidate reports         | Deterministic context compiler visualization |
| Platform engineering      | OSC local reproducibility             | Static Control Plane                         |
| Security engineering      | OSC auth/proxy tracing                | libnftnl structured fuzzer                   |
| Developer tooling         | SearchBench Go/Pkl product surface    | Static Control Plane                         |
| Frontend systems          | Tarigma windowed operator workspace   | Chart.js temporal annotation                 |
| Technical solutions / FDE | OSC systems translation               | STEMTree teaching + operations               |
| Conflict / ambiguity      | OSC reproducibility under uncertainty | Tarigma abstraction restraint                |
| Communication / teaching  | STEMTree uncertainty teaching         | Technical writing platform                   |
| Non-traditional path      | Artifact-based learning arc           | OfficeMax social compression + current focus |

---

## Stories

### [AI Infrastructure / Evaluation] SearchBench — Turning Agent Changes into Release Decisions

**Source:** CV + article-digest — SearchBench / AI Agents Need Release Reports
**Use when asked about:** most impactful project, AI evaluation, technical ownership, product thinking, ambiguity, systems design, developer tooling, testing, release quality.

**S (Situation):**
AI agent systems are increasingly made of many moving pieces: prompts, retrieval policies, tool schemas, model/provider settings, scoring rules, runtime assumptions, and cost constraints. While building agentic code-search experiments, I realized that a single trace or score was not enough to decide whether a candidate change was actually better.

**T (Task):**
I wanted to build a harness that could compare a baseline code-search system against a candidate policy, evaluate localization quality, track token and cost usage, capture failures/regressions, and produce a report that answered a release-style question: should this candidate replace the baseline?

**A (Action):**
I built SearchBench as a typed evaluation harness. In the Python version, I modeled canonical localization tasks, predictions, run results, scoring bundles, static-graph scoring, telemetry, prompt templates, and backend adapters. In the Go/Pkl version, I pushed the design toward a product surface: manifest-driven experiments, pure domain models, run bundles, objective outputs, report serialization, and promotion decisions.

**R (Result):**
The project became a concrete evaluation pipeline rather than a loose experiment. It can represent baseline-vs-candidate comparisons, token/cost usage, scoring dimensions, regressions, and promotion decisions. It also gave me a clear product thesis: AI agents need release reports, not just traces.

**Reflection:**
The biggest lesson was that the right unit of evaluation is larger than a prompt or a single trace. For complex AI systems, the important object is the candidate system version and the evidence around whether it should ship. I also learned that typed models and boring reproducibility work matter even more when the runtime is probabilistic.

**Strong closing sentence:**
"That project is probably the cleanest example of how I think: take ambiguous runtime behavior, turn it into structured evidence, and make a decision boundary around it."

**Best for questions about:**

* "Tell me about your most impactful project."
* "How do you evaluate AI systems?"
* "Tell me about a system you designed from scratch."
* "How do you handle ambiguity?"
* "What kind of engineering work are you strongest at?"

---

### [Platform / Security] OSC — Reproducing a Production-Adjacent HPC Platform Locally

**Source:** CV + private notes — Ohio State Supercomputer Center
**Use when asked about:** platform engineering, infrastructure debugging, ambiguous systems, reproducibility, ownership without perfect access, documentation, learning fast.

**S (Situation):**
At OSC, I worked around a complex HPC web platform with many moving parts: application code, deployment scripts, Apache/Nginx proxy layers, auth boundaries, Unix identity assumptions, CI behavior, and runtime configuration. The system was hard to reason about directly, and production access was limited.

**T (Task):**
I needed to understand and document how the platform actually worked end to end, while also creating a local environment that made the system easier to reason about without relying on production access or tribal knowledge.

**A (Action):**
I traced real code paths across the application, deployment, runtime behavior, CI, proxy layers, and auth boundaries. I then worked on translating the production-adjacent deployment into a Docker-based local development/demo environment. Along the way, I documented the architecture in terms of actual behavior rather than just intended design.

**R (Result):**
The work produced a clearer operating model for the platform and made it possible to reason about more of the system locally. It also exposed where environment drift and dependency management were blocking reliable development and security testing.

**Reflection:**
I learned that reproducibility is not just developer convenience. It is a cognitive tool. If you cannot reproduce enough of a system locally, you cannot safely reason about its security, behavior, or failure modes. That experience is a major reason I care about Nix, containers, typed configuration, and local testability.

**Strong closing sentence:**
"That experience taught me to treat reproducibility as part of the system model, not as an afterthought."

**Best for questions about:**

* "Tell me about a time you dealt with a messy system."
* "How do you learn a large codebase or platform?"
* "Tell me about a time you worked without full access or perfect documentation."
* "What does platform engineering mean to you?"

---

### [Security / Auth Boundaries] OSC — Tracing Auth and Proxy Behavior Across Layers

**Source:** CV + private notes — Ohio State Supercomputer Center
**Use when asked about:** security engineering, auth/IAM, cross-layer debugging, security testing, vulnerability intuition, careful investigation.

**S (Situation):**
The OSC platform relied on multiple layers to handle identity and access: Rails application behavior, generated Apache configs, Nginx instances, Lua routing logic, OIDC/LDAP-related glue, Unix identity assumptions, and upstream-header trust boundaries. Correctness lived across the composition, not in one file.

**T (Task):**
I needed to understand where authority actually lived in the request path and how the system translated identity and authorization across layers. That understanding was necessary before meaningful security tests could be written.

**A (Action):**
I traced authentication and authorization behavior end to end, focusing on how requests moved through proxy layers and how identity was represented at each boundary. While analyzing URL handling and routing behavior, I identified double URL encoding behavior with RCE-adjacent implications and began designing end-to-end tests around those boundaries.

**R (Result):**
The investigation clarified security-relevant trust boundaries that were not obvious from any single component. It also produced a concrete security testing direction and highlighted how a bug could live across abstraction boundaries rather than inside one isolated function.

**Reflection:**
The lesson I took from this is that security bugs often live where one layer trusts another layer's interpretation of intent. I now look for semantic seams: encoding boundaries, proxy headers, generated configs, identity translations, and places where runtime behavior depends on configuration-time assumptions.

**Strong closing sentence:**
"My security instincts are strongest at semantic boundaries, where systems quietly trust that another layer preserved meaning correctly."

**Best for questions about:**

* "Tell me about a security issue you found."
* "How do you approach auth or IAM systems?"
* "What kind of vulnerabilities interest you?"
* "Tell me about a time you had to trace behavior across multiple layers."

---

### [Frontend Systems / Operator Tooling] Tarigma — Windowed State for Grid Incident Response

**Source:** CV + private notes — Tarigma / GE Vernova
**Use when asked about:** frontend systems, complex state, user empathy, operator tools, startup experience, product/system correctness.

**S (Situation):**
At Tarigma, the product supported electrical grid incident response. Operators needed to understand events that unfolded over time, compare signals, move between views, and keep their mental model intact under stress. The frontend was not just presentation; it was an operational workspace.

**T (Task):**
I owned the integration between Recoil state management and react-mosaic windowed layouts. The challenge was to keep dynamic panes, live data, focus changes, layout restoration, and asynchronous updates coherent without making the UI lie to the operator.

**A (Action):**
I treated the workspace as a state coordination problem. I worked on preserving spatial and temporal context across layout changes, window lifecycle events, live data updates, and user focus shifts. The goal was not just to render components, but to protect the operator's ability to reason through an incident.

**R (Result):**
The work helped stabilize a complex operator-facing UI surface and gave the application a more coherent model for windowed state. It also gave me a deep intuition that frontend systems can have distributed-systems-like correctness problems: timing, authority, partial updates, and state drift.

**Reflection:**
I learned that UI correctness is not only visual. In operational software, time, space, focus, and state continuity are part of correctness. That lesson carries into my current work on graph visualizations, AI tooling, and explainable interfaces.

**Strong closing sentence:**
"Tarigma taught me that the frontend can be the place where system correctness becomes human-legible."

**Best for questions about:**

* "Tell me about complex frontend work."
* "How do you think about users under stress?"
* "Tell me about a hard state-management problem."
* "How do you balance product and engineering?"

---

### [Design Restraint / Abstraction Boundaries] Tarigma — Extending Chart.js Instead of Rewriting It

**Source:** CV + private notes — Tarigma / GE Vernova
**Use when asked about:** technical judgment, restraint, maintaining legacy/custom code, design decisions, avoiding overengineering.

**S (Situation):**
The product needed a draggable temporal annotation in an Oscillograph-style dashboard. Existing Chart.js behavior and plugin abstractions could not express the exact interaction the operators needed.

**T (Task):**
I needed to add the interaction without turning the charting layer into an unmaintainable rewrite or breaking existing animation and annotation semantics.

**A (Action):**
I maintained a custom Chart.js fork and extended the existing annotation subsystem surgically. Instead of replacing the charting architecture, I reused the existing affordances, added the necessary dragging behavior, and preserved animation semantics. I also used interpolation to avoid jarring jumps when computed time anchors changed.

**R (Result):**
The UI could support the needed temporal interaction while staying legible to future maintainers. The design preserved continuity for operators and avoided unnecessary platform churn.

**Reflection:**
This story is a good example of restraint. The technically satisfying solution is not always a new abstraction or rewrite. Sometimes the senior move is to preserve the shape of the existing system and extend it just enough to make the right thing possible.

**Strong closing sentence:**
"I try to know when not to build a new platform, and when the right move is a careful extension of the system people already understand."

**Best for questions about:**

* "Tell me about a technical tradeoff."
* "Tell me about a time you avoided overengineering."
* "How do you work with existing systems?"
* "What does good engineering taste mean to you?"

---

### [Security Research / Systems Programming] libnftnl Fuzzer — Exploring Firewall Semantic Boundaries

**Source:** CV + article-digest — libnftnl / netfilter Structured Fuzzer
**Use when asked about:** systems programming, security research, fuzzing, learning hard technical domains, Linux/networking, typed wrappers over unsafe APIs.

**S (Situation):**
I became interested in where Linux firewall semantics actually become concrete. The packet filter executes in the kernel, but the path from human policy to kernel objects passes through nftables, userland compilation, libnftnl object construction, and Netlink serialization.

**T (Task):**
I wanted to explore that boundary with a structure-aware fuzzer instead of treating the whole system as raw bytes. The goal was to understand the semantic and serialization surface where policy gets lowered into executable structure.

**A (Action):**
I built a Nim/Nix fuzzing harness around libnftnl. I generated bindings, wrapped C pointer lifetimes with RAII-style types, modeled tables/chains/rules/expressions, mapped protobuf-shaped inputs into libnftnl objects, and built serialization paths into Netlink messages. I also worked on reproducible fuzzing infrastructure with containers, MicroVM-oriented runtime pieces, sanitizer/coverage support, and metrics.

**R (Result):**
The project produced a working structured harness and a much clearer mental model of where semantic authority lives in the nftables stack. It also became the basis for my essay "The Firewall Doesn't Live in the Kernel."

**Reflection:**
I learned that even if a project does not produce a polished exploit, it can still produce valuable systems knowledge. The important result was the map: understanding which layer owns structure, which layer owns meaning, and where mismatches could become security-relevant.

**Strong closing sentence:**
"That project reflects how I learn hard systems: build a harness, make the boundary explicit, and let the system show me where its invariants actually live."

**Best for questions about:**

* "Tell me about a hard technical project."
* "How do you learn unfamiliar low-level systems?"
* "What security work have you done?"
* "Tell me about a project where the result was understanding, not just a feature."

---

### [Platform / Typed Infrastructure] Static Control Plane — Making Infrastructure Inspectable Before Runtime

**Source:** CV + article-digest — Static Control Plane
**Use when asked about:** platform engineering, infrastructure as code, Kubernetes, testing, reproducibility, type safety, CI/CD, design-time validation.

**S (Situation):**
Infrastructure configuration often fails late. YAML, CRDs, controllers, cloud APIs, secrets, ingress, and GitOps tools interact in ways that are difficult to reason about before runtime.

**T (Task):**
I wanted to explore whether typed configuration, generated schemas, and tests could make infrastructure structure more inspectable before deploying to a real cluster.

**A (Action):**
I built a static control-plane experiment using KCL, Crossplane, Buck2, Nix, generated schemas, and pytest validation. The project modeled Crossplane-managed resources, DigitalOcean resources, FluxCD, Helm releases, Infisical-managed secrets, Traefik ingress, and NixOS/FRPS configuration. I also worked on codegen paths from CRDs and Go schema inputs into typed resource surfaces.

**R (Result):**
The project demonstrated how infrastructure could be treated as a pre-runtime reasoning surface rather than a bag of YAML. It gave me a practical platform-engineering artifact connecting typed interfaces, generated configuration, tests, GitOps, and reproducibility.

**Reflection:**
The core lesson was that not every infrastructure problem should be solved by adding a stronger runtime control plane. Sometimes the better move is to make the desired structure explicit earlier, test it, and reduce the number of impossible states that reach runtime at all.

**Strong closing sentence:**
"I like infrastructure tools that make invalid or fragile states visible before the cluster has to discover them for you."

**Best for questions about:**

* "How do you think about infrastructure as code?"
* "Tell me about a platform project."
* "What is your approach to deployment safety?"
* "How do you use type systems or tests in infrastructure?"

---

### [AI Developer Tools / Visualization] Deterministic Context Compiler — Explaining Why Context Was Selected

**Source:** CV + article-digest — Deterministic Context Compiler Visualization
**Use when asked about:** AI developer tools, graph UIs, frontend systems, explainability, product thinking, context engineering.

**S (Situation):**
In AI code-search workflows, context is often selected through heuristic retrieval: top-K files, embeddings, or tool calls. That can work, but it is hard to explain why something was included, why something was missed, or whether the context satisfies the actual reasoning need.

**T (Task):**
I wanted to visualize context selection as a deterministic graph/constraint process: start from anchors, expand through code relationships, pack under a token budget, detect missing symbols, refine, and explain the final context bundle.

**A (Action):**
I designed and prototyped a Next.js / React Flow / Framer Motion visualization. It included graph event models, reducer logic, playback state, animated graph nodes/edges, token panes, search scope controls, and tests. The demo showed anchors, expansions, in-context nodes, token budget changes, and missing-symbol refinement.

**R (Result):**
The prototype made the context-selection process visible. Instead of showing only the final prompt, it showed the reasoning substrate: what was included, what constraint caused expansion, how the token budget changed, and what failure mode occurred if the solver stopped.

**Reflection:**
The lesson was that explainability is not only a model-output problem. Tooling itself can make system behavior legible by exposing the intermediate decisions that led to an answer. That connects directly to my broader interest in observability and release-quality AI systems.

**Strong closing sentence:**
"The interface was designed to answer not just 'what context did we return?' but 'why was this the minimal evidence graph we trusted?'"

**Best for questions about:**

* "Tell me about a frontend project."
* "How would you design AI developer tools?"
* "How do you make complex systems explainable?"
* "Tell me about a product idea you prototyped."

---

### [Platform / Deployment / Nix] Asahi NixOS Workstation Platform — Treating a Laptop Like Real Infrastructure

**Source:** CV + article-digest — Asahi NixOS Workstation Platform
**Use when asked about:** Nix, reproducibility, deployment safety, Linux platform ownership, packaging, Apple Silicon, nonstandard environments.

**S (Situation):**
Running NixOS on a MacBook M2 through Asahi Linux puts you in an environment with real hardware and packaging constraints: Apple Silicon support, graphics/audio/session configuration, Wayland behavior, Electron/runtime compatibility, and the usual developer-environment drift problems.

**T (Task):**
I wanted the machine to behave like a platform I could reason about, not like a pile of manual fixes. The goal was to make the workstation reproducible, inspectable, and rebuildable despite being a non-default Linux setup on Apple Silicon.

**A (Action):**
I built and maintained a flake-based NixOS + Home Manager configuration covering system packages, user environment, firmware integration, desktop/session settings, and developer tooling. I added custom overlays, wrappers, and package definitions for local tools and desktop apps, handled architecture-specific runtime issues, and used pinned dependencies and explicit environment settings to reduce breakage around Mesa, GPU acceleration, and Electron packaging on aarch64 Linux.

**R (Result):**
The laptop became a controlled platform surface instead of a drifting environment. I could rebuild the machine predictably, reason about why a package or runtime behaved a certain way, and make hardware-specific behavior explicit in configuration rather than tribal knowledge.

**Reflection:**
The lesson was that deployment thinking applies well below production clusters. A workstation can also be a systems boundary where packaging, runtime behavior, architecture constraints, and developer experience all meet. Treating that surface explicitly builds better instincts for platform and deployment work.

**Strong closing sentence:**
"That project is basically deployment engineering in miniature: make the environment explicit, pin what matters, and remove as much ambient drift as possible."

**Best for questions about:**

* "Tell me about your Nix experience."
* "How do you think about reproducibility?"
* "Have you worked on nonstandard Linux or ARM environments?"
* "What is your approach to deployment safety?"

---

### [Teaching / Communication] STEMTree — Teaching Students to Sit With Uncertainty

**Source:** CV + private notes — STEMTree
**Use when asked about:** communication, teaching, mentoring, customer-facing work, emotional intelligence, adapting to audience, technical enablement.

**S (Situation):**
At STEMTree, I taught programming and STEM concepts to students with very different ability levels and levels of confidence. Some students were high-aptitude and moved quickly; others were discouraged or uncomfortable with uncertainty.

**T (Task):**
My job was not just to get students through exercises. I needed to help them build the mental habits required to learn technical material: breaking problems down, tolerating confusion, debugging, and staying engaged when an answer was not immediate.

**A (Action):**
I taught Python, web concepts, electronics, and physics while adapting pacing to the student. For stronger students, I accelerated and expanded the path, including guiding one student from zero to React over roughly a year. For struggling students, I focused on reducing shame and making uncertainty feel workable.

**R (Result):**
Students were able to keep progressing across very different levels of readiness. The experience also trained my ability to explain technical material without flattening it, and to notice when a person needs a different interface into the same concept.

**Reflection:**
STEMTree taught me that communication is not simplification. Good teaching preserves the truth while changing the path into it. That has influenced how I write documentation, explain systems, and work with non-specialists.

**Strong closing sentence:**
"That experience is why I care about interfaces: the same system may need different surfaces for different people to reason about it safely."

**Best for questions about:**

* "How do you explain technical concepts?"
* "Tell me about mentoring or teaching."
* "How do you work with non-technical people?"
* "How do you handle frustrated users or learners?"

---

### [Operational Responsibility / Guardrails] STEMTree — Network-Level Safety Instead of Constant Policing

**Source:** CV + private notes — STEMTree
**Use when asked about:** ownership, practical infrastructure, safety, guardrails, initiative, operations, affordances over enforcement.

**S (Situation):**
In the STEMTree classroom, students used shared laptops and had access to the local network. That created practical safety and management concerns around inappropriate content and device readiness.

**T (Task):**
I wanted to make the environment safer without relying only on constant monitoring or individual correction.

**A (Action):**
I managed student laptops and configured a Raspberry Pi / Pi-hole setup, modifying network/router settings to block inappropriate content at the network level. The goal was to create a practical guardrail: make the wrong thing harder by shaping the environment.

**R (Result):**
The classroom became easier to operate safely, and the solution reduced the burden on constant manual supervision. It was a small example of infrastructure as a human-safety tool.

**Reflection:**
This is one of the earliest places I learned the value of affordances over enforcement. Good systems do not depend entirely on people remembering to behave correctly. They guide behavior through constraints and defaults.

**Strong closing sentence:**
"That small network project is still how I think about platform work: build guardrails that make safe behavior the easy path."

**Best for questions about:**

* "Tell me about taking initiative."
* "How do you think about guardrails?"
* "Tell me about a practical technical fix."
* "How do you reduce operational burden?"

---

### [Current Growth / Communication] OfficeMax — Practicing Compression in a Customer-Facing Role

**Source:** CV + current work context
**Use when asked about:** current role, communication, humility, customer-facing skill, job transition, non-technical work, growth.

**S (Situation):**
While pursuing platform/infrastructure roles, I have been working at OfficeMax as holdover work. It is not the career target, but it is a real customer-facing environment with constant context switching and practical communication demands.

**T (Task):**
I wanted to stay employed while also using the environment deliberately to improve a skill that matters in technical work: compressing explanations for people who do not share my context.

**A (Action):**
I handle customer needs, task switching, and workplace coordination while practicing clear, short explanations. I treat it as training for social compression: explaining enough to be useful without overloading the listener.

**R (Result):**
The role has helped me stay grounded and improve real-time communication. It also gives me current employment continuity while I continue building technical artifacts and applying for infrastructure/platform roles.

**Reflection:**
The lesson is humility and compression. Technical depth only matters if I can decide how much of it the situation actually needs. That is especially relevant for solutions engineering, documentation, and platform work where the audience varies widely.

**Strong closing sentence:**
"It is not my target field, but I have used it intentionally to practice the kind of concise communication that technical roles still require."

**Best for questions about:**

* "What are you doing currently?"
* "How do you communicate with non-technical people?"
* "How do you handle customer-facing work?"
* "Why the transition from retail back into technical work?"

---

## Background / Red-Flag Framing

These are not full STAR stories. They are safe framing blocks for predictable questions.

### Why did you leave school / why no completed degree?

**Use this answer:**
"I left school after an early research/engineering role showed me that I learn and produce better in high-agency environments than inside institutional pacing. I got early exposure to how ownership, incentives, and real systems behave, and it pushed me toward artifact-based work where the feedback loops are tighter. Since then, I have focused on building public and professional artifacts that make my thinking legible: SearchBench, typed infrastructure experiments, security research, and technical writing."

**Do not say:**

* "School could not contain me."
* "Academia failed me."
* "Credentials are meaningless."
* Anything that sounds resentful or superiority-coded.

**Best follow-up:**
"I understand the degree question. The reason I point to artifacts is that they show how I think and what I can build directly."

---

### Why are your projects so varied?

**Use this answer:**
"They look varied by layer, but they are consistent by problem shape. SearchBench, the static control plane work, the nftables fuzzer, and the Tarigma UI work are all about making hard-to-see system behavior explicit. The layer changes; the move is the same: find the seam where meaning can drift, then build a tool or interface that makes it easier to reason about."

---

### Are you more frontend, infra, security, or AI?

**Use this answer:**
"My center of gravity is platform/infrastructure and developer tooling. Frontend, security, and AI show up because they are places where system behavior has to become legible to humans. The roles I am targeting are the ones where that translation layer is valuable: platform, infra, security, AI evals, devtools, and high-context technical solutions work."

---

### Why should we take a chance on you with a non-traditional background?

**Use this answer:**
"The best reason is that my work is inspectable. I am not asking you to infer potential from credentials alone. You can look at SearchBench, the Go/Pkl experiment surface, the nftables fuzzer, the static control plane work, and the technical writing. They show how I model systems, how I test, how I communicate, and how I handle ambiguity."

---

## Interview Reminders

* Do not over-explain the private version of the story.
* Lead with artifacts, not autobiography.
* When discussing OSC, stay professional: ambiguity, reproducibility, auth boundaries, documentation, local environments.
* When discussing STEMTree, use it as communication/guardrails evidence, not as the center of the technical story.
* When discussing OfficeMax, frame it as current continuity and communication practice, not as a career detour requiring apology.
* When discussing SearchBench, slow down. It is dense. Start with the release-report problem before naming all components.
* Always end stories with the transferable lesson.
