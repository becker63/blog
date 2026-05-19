export type MdxConversionWarning = {
  code: string;
  message: string;
};

const jsxComponentPattern = /<([A-Z][A-Za-z0-9]*)\b[^>]*\/?>/g;
const jsxClosingPattern = /<\/([A-Z][A-Za-z0-9]*)>/g;
const htmlCommentPattern = /<!--[\s\S]*?-->/g;

export const mdxToMarkdown = (
  mdxBody: string,
): { markdown: string; warnings: MdxConversionWarning[] } => {
  const warnings: MdxConversionWarning[] = [];
  let text = mdxBody.replace(htmlCommentPattern, "");

  const components = new Set<string>();
  for (const match of text.matchAll(jsxComponentPattern)) components.add(match[1] ?? "");
  for (const match of text.matchAll(jsxClosingPattern)) components.add(match[1] ?? "");
  for (const component of components) {
    warnings.push({
      code: "unsupported_jsx",
      message: `Stripped unsupported MDX component: ${component}`,
    });
  }

  text = text
    .replace(jsxComponentPattern, "")
    .replace(jsxClosingPattern, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { markdown: text, warnings };
};
