import type { TextAlign } from "./textStyle";

interface BuildTextLayoutOptions {
  text: string;

  width: number;
  height: number;

  fontSize: number;

  marginX: number;

  align?: TextAlign;
}

export interface TextLayout {
  text: string;

  lines: string[];

  maxCharsPerLine: number;

  align: TextAlign;
}

export function buildTextLayout({
  text,
  width,
  fontSize,
  marginX,
  align = "center",
}: BuildTextLayoutOptions): TextLayout {

  //-----------------------------------------
  // Área útil
  //-----------------------------------------

  const usableWidth =
    width - marginX * 2;

  //-----------------------------------------
  // Estimativa da largura média
  //-----------------------------------------

  const averageCharWidth =
    fontSize * 0.58;

  //-----------------------------------------
  // Máximo de caracteres por linha
  //-----------------------------------------

  const maxCharsPerLine = Math.max(
    8,
    Math.floor(
      usableWidth / averageCharWidth
    )
  );

  //-----------------------------------------
  // Quebra inteligente
  //-----------------------------------------

  const words = text
    .trim()
    .split(/\s+/);

  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {

    const testLine =
      currentLine.length === 0
        ? word
        : `${currentLine} ${word}`;

    if (
      testLine.length <=
      maxCharsPerLine
    ) {

      currentLine = testLine;

    } else {

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      currentLine = word;

    }

  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  //-----------------------------------------

  return {

    text: lines.join("\n"),

    lines,

    maxCharsPerLine,

    align,

  };

}

