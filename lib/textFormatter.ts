export interface FormattedText {
  text: string;
  lines: string[];
}

interface TextFormatterOptions {
  text: string;
  maxCharsPerLine: number;
  maxLines?: number;
}

export function formatText({
  text,
  maxCharsPerLine,
  maxLines = 8,
}: TextFormatterOptions): FormattedText {

  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  const lines: string[] = [];

  let current = "";

  for (const word of words) {

    const test = current
      ? `${current} ${word}`
      : word;

    if (test.length <= maxCharsPerLine) {

      current = test;

    } else {

      if (current) {
        lines.push(current);
      }

      current = word;

    }

  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {

    const remaining = lines
      .slice(maxLines - 1)
      .join(" ");

    lines.splice(
      maxLines - 1,
      lines.length,
      remaining
    );

  }

  return {

    text: lines.join("\n"),

    lines,

  };

}