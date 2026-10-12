# Resume

Edit `content/resume.json`; it is the authoritative resume source.
Run `bun run resume:build` to regenerate `apps/blog/public/resume.html` and
`resume.txt`. The Nx blog prebuild runs this renderer automatically, and both
source files participate in the shared build inputs. Commit the source and both
rendered outputs. The former resume HTML was maintained directly; the longer
career-ops CV remains a separate evidence bank, not this resume renderer.

The page is a semantic, single-column resume with no external assets or scripts.
Use its print button to print or save a PDF; print styling hides the navigation
and keeps project/experience entries together. The text download is suitable
for ATS forms. There is no separately maintained PDF source to update.

Keep independent work labelled as projects, preserve actual employment titles,
and scope metrics to their frozen evaluation populations. AI Tinkerers named
SearchBench a Community Favorite in Top AI Demos #31; that is a designation,
not a competition win. The resume links to both the demo and the roundup.
