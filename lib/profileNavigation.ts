import { BlogPost } from "./blogs";

export type ProfileCategoryId =
  | "security-systems"
  | "platform-social-infrastructure";

export type ProfileGlyph = "shield" | "nodes";

export type ProfileLink = {
  label: string;
  href: string;
  accent: string;
};

export type ProfileWorkOffering = {
  title: string;
  description: string;
};

export type ProfileWorkWithMeCopy = {
  title: string;
  intro: string;
  pricing: string;
  offerings: ProfileWorkOffering[];
};

export type ProfileCategoryDefinition = {
  id: ProfileCategoryId;
  title: string;
  description: string;
  glyph?: ProfileGlyph;
};

export type SearchTreeChild = {
  kind: "child";
  id: string;
  title: string;
  description?: string;
  href: string;
  type: "post" | "project" | "page";
  tags?: string[];
  date?: string;
  blog: BlogPost;
};

export type SearchTreeParent = {
  kind: "parent";
  id: ProfileCategoryId;
  title: string;
  description: string;
  glyph?: ProfileGlyph;
  children: SearchTreeChild[];
};

export const PROFILE_PANEL_COPY = {
  name: "Taylor Johnson",
  portraitSrc:
    "https://media.licdn.com/dms/image/v2/D4E35AQE5x00dVBomqQ/profile-framedphoto-shrink_200_200/B4EZxaLhS4IsAY-/0/1771039495656?e=1778529600&v=beta&t=CSc7v2PW1enN2Q2Ml61q6ut9W-E0G5KPnRfNoXTDp24",
  portraitAlt: "Portrait of Taylor Johnson",
  identity:
    "I make opaque infrastructure and AI systems legible enough to debug, automate, and trust.",
  summary:
    "I work where systems are powerful but hard to explain: auth stacks, Linux/networking boundaries, developer environments, AI coding agents, eval harnesses, and internal platforms. My usual output is the missing map — docs, tools, traces, reports, and visualizations that help teams understand what the system is doing and decide what to change next.",
};

export const PROFILE_WORK_WITH_ME_COPY: ProfileWorkWithMeCopy = {
  title: "Work with me",
  intro:
    "I help teams make complex infrastructure, developer tooling, security boundaries, and AI workflows easier to understand, reproduce, and improve.",
  pricing:
    "Typical starting point: $60/hr, with fixed-scope starter projects available for well-defined work.",
  offerings: [
    {
      title: "System mapping sprint",
      description:
        "I reverse-engineer unclear infrastructure, auth flows, deployment paths, or internal tools into diagrams, runbooks, risk notes, and concrete cleanup recommendations.",
    },
    {
      title: "Dev environment / CI sprint",
      description:
        "Make your project easier to run, test, and deploy by cleaning up Docker, local setup, dependency drift, CI/CD pipelines, and build reproducibility issues.",
    },
    {
      title: "AI workflow evaluation sprint",
      description:
        "Make AI prototypes measurable by defining success criteria, capturing traces, comparing versions, and reporting what improved or regressed.",
    },
  ],
};

export const PROFILE_CATEGORIES: Record<
  ProfileCategoryId,
  ProfileCategoryDefinition
> = {
  "security-systems": {
    id: "security-systems",
    title: "Security / Systems Work",
    description:
      "Deep technical work on opaque systems: Linux networking, firewall behavior, fuzzing, IAM, reproducibility, and security boundaries. This is where I investigate how systems actually behave underneath their public interfaces.",
    glyph: "shield",
  },
  "platform-social-infrastructure": {
    id: "platform-social-infrastructure",
    title: "Platform / Social Infrastructure Work",
    description:
      "Work about interfaces between people, agents, and infrastructure: AI evals, SearchBench, developer tools, documentation systems, configuration languages, visualization, and the ways teams coordinate through software.",
    glyph: "nodes",
  },
};

export const PROFILE_CATEGORY_ORDER: ProfileCategoryId[] = [
  "platform-social-infrastructure",
  "security-systems",
];

export const PROFILE_POST_CATEGORY_ASSIGNMENTS: Record<
  string,
  ProfileCategoryId
> = {
  "the-firewall-doesnt-live-in-the-kernel": "security-systems",
  "tight-loops": "security-systems",
  "ai-release-reports": "platform-social-infrastructure",
  bundles: "platform-social-infrastructure",
  "designing-for-two": "platform-social-infrastructure",
};

export const PROFILE_EXCLUDED_POSTS: Record<string, string> = {
  // Add intentional exclusions here when a published post should stay out of the
  // profile-navigation surface, along with the reason it is excluded.
};

const formatChildHref = (slug: string) => `/Blogs/${slug}`;

const childMatchesSearch = (child: SearchTreeChild, query: string) => {
  const searchLower = query.toLowerCase();
  return (
    child.title.toLowerCase().includes(searchLower) ||
    (child.description ?? "").toLowerCase().includes(searchLower) ||
    (child.tags ?? []).some((tag) => tag.toLowerCase().includes(searchLower))
  );
};

export const assertExhaustiveProfileAssignments = (posts: BlogPost[]) => {
  const postSlugs = new Set(posts.map((post) => post.slug));

  const assignedSlugs = Object.keys(PROFILE_POST_CATEGORY_ASSIGNMENTS);
  const excludedSlugs = Object.keys(PROFILE_EXCLUDED_POSTS);

  const overlap = assignedSlugs.filter(
    (slug) => slug in PROFILE_EXCLUDED_POSTS,
  );
  if (overlap.length > 0) {
    throw new Error(
      `Posts cannot be both assigned and excluded: ${overlap.join(", ")}`,
    );
  }

  const unknownAssigned = assignedSlugs.filter((slug) => !postSlugs.has(slug));
  if (unknownAssigned.length > 0) {
    throw new Error(
      `Profile category assignments reference unknown posts: ${unknownAssigned.join(", ")}`,
    );
  }

  const unknownExcluded = excludedSlugs.filter((slug) => !postSlugs.has(slug));
  if (unknownExcluded.length > 0) {
    throw new Error(
      `Profile exclusions reference unknown posts: ${unknownExcluded.join(", ")}`,
    );
  }

  const unassignedPosts = posts
    .map((post) => post.slug)
    .filter(
      (slug) =>
        !(slug in PROFILE_POST_CATEGORY_ASSIGNMENTS) &&
        !(slug in PROFILE_EXCLUDED_POSTS),
    );

  if (unassignedPosts.length > 0) {
    throw new Error(
      `Every published post must be assigned or excluded. Missing: ${unassignedPosts.join(", ")}`,
    );
  }
};

export const buildProfileSearchTree = (
  posts: BlogPost[],
): SearchTreeParent[] => {
  assertExhaustiveProfileAssignments(posts);

  return PROFILE_CATEGORY_ORDER.map((categoryId) => {
    const category = PROFILE_CATEGORIES[categoryId];
    const children = posts
      .filter(
        (post) => PROFILE_POST_CATEGORY_ASSIGNMENTS[post.slug] === categoryId,
      )
      .map<SearchTreeChild>((post) => ({
        kind: "child",
        id: post.slug,
        title: post.meta.title,
        description: post.meta.description,
        href: formatChildHref(post.slug),
        type: "post",
        tags: post.meta.tags,
        date: post.meta.date.toISOString(),
        blog: post,
      }));

    return {
      kind: "parent",
      id: category.id,
      title: category.title,
      description: category.description,
      glyph: category.glyph,
      children,
    };
  });
};

export const filterProfileSearchTree = (
  tree: SearchTreeParent[],
  query: string,
) => {
  const normalized = query.trim();
  if (!normalized) return tree;

  return tree
    .map((parent) => ({
      ...parent,
      children: parent.children.filter((child) =>
        childMatchesSearch(child, normalized),
      ),
    }))
    .filter((parent) => parent.children.length > 0);
};
