export type TocItem = {
  id: string;
  text: string;
  level: number;
};

const slugifyHeading = (value: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "section";
};

const createSlugger = () => {
  const counts = new Map<string, number>();
  return (value: string) => {
    const base = slugifyHeading(value);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
};

export const extractToc = (
  content: string,
  { minLevel = 2, maxLevel = 4 } = {}
): TocItem[] => {
  const lines = content.split(/\r?\n/);
  const slugger = createSlugger();
  const items: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,6})\s+(.+)$/.exec(trimmed);
    if (!match) continue;

    const level = match[1].length;
    if (level < minLevel || level > maxLevel) continue;

    const raw = match[2].replace(/\s*#+\s*$/, "").trim();
    if (!raw) continue;

    items.push({
      id: slugger(raw),
      text: raw,
      level,
    });
  }

  return items;
};

export const createHeadingSlugger = createSlugger;
