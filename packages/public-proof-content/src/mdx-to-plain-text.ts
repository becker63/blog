const fencePattern = /```[\s\S]*?```/g;
const inlineCodePattern = /`([^`]+)`/g;
const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
const headingPattern = /^#{1,6}\s+/gm;
const blockquotePattern = /^>\s?/gm;
const htmlTagPattern = /<[^>]+>/g;

export const mdxToPlainText = (mdxBody: string): string =>
  mdxBody
    .replace(fencePattern, (block) => block.replace(/```\w*\n?/g, "").replace(/```/g, ""))
    .replace(imagePattern, "$1")
    .replace(linkPattern, "$1 ($2)")
    .replace(inlineCodePattern, "$1")
    .replace(headingPattern, "")
    .replace(blockquotePattern, "")
    .replace(htmlTagPattern, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
