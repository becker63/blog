const truncate = (value: string, maxLength = 2000) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}\n...[truncated]` : value;

const tryParse = (value: string): unknown | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const extractFirstObject = (text: string) => {
  const start = text.indexOf("{");
  if (start < 0) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) return text.slice(start, index + 1);
  }

  return undefined;
};

export const parseModelJson = (text: string) => {
  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct !== undefined) return direct;

  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if (fencedJson) {
    const parsed = tryParse(fencedJson.trim());
    if (parsed !== undefined) return parsed;
  }

  const firstObject = extractFirstObject(trimmed);
  if (firstObject) {
    const parsed = tryParse(firstObject);
    if (parsed !== undefined) return parsed;
  }

  throw new Error(`Model output did not contain valid JSON:\n${truncate(trimmed)}`);
};
