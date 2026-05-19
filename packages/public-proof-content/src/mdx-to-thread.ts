export type ThreadChunk = {
  index: number;
  text: string;
  charCount: number;
};

export const splitIntoThread = (
  text: string,
  maxChars = 280,
): ThreadChunk[] => {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      flush();
      let remaining = paragraph;
      while (remaining.length > maxChars) {
        const slicePoint = remaining.lastIndexOf(" ", maxChars);
        const cut = slicePoint > 40 ? slicePoint : maxChars;
        chunks.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut).trim();
      }
      if (remaining) current = remaining;
      continue;
    }

    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      flush();
      current = paragraph;
    }
  }
  flush();

  return chunks.map((chunk, index) => ({
    index: index + 1,
    text: chunk,
    charCount: chunk.length,
  }));
};
