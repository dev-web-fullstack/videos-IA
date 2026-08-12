// lib/textLayout.ts
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
  justified?: boolean;
}

export function buildTextLayout({
  text,
  width,
  height,
  fontSize,
  marginX,
  align = "center",
}: BuildTextLayoutOptions): TextLayout {

  // Área útil COM margens reduzidas (para centralizado ficar mais perto das bordas)
  const usableWidth = width - marginX * 2;

  // Estimativa de largura dos caracteres (ajustado para melhor precisão)
  const averageCharWidth = fontSize * 0.58;
  const maxCharsPerLine = Math.max(
    5,
    Math.floor(usableWidth / averageCharWidth)
  );

  console.log(`🔤 Máximo de caracteres por linha: ${maxCharsPerLine}`);
  console.log(`📐 Largura útil: ${usableWidth}px, Fonte: ${fontSize}px`);

  // Limpar e quebrar texto
  const words = text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ");

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine.length === 0
      ? word
      : `${currentLine} ${word}`;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      if (word.length > maxCharsPerLine) {
        let remaining = word;
        while (remaining.length > 0) {
          const chunk = remaining.slice(0, maxCharsPerLine);
          remaining = remaining.slice(maxCharsPerLine);
          lines.push(chunk);
          if (remaining.length > 0) {
          }
        }
        currentLine = "";
      } else {
        currentLine = word;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Limitar número de linhas
  const maxLines = Math.floor(height / (fontSize * 1.5));

  console.log(`📏 Máximo de linhas: ${maxLines}, Geradas: ${lines.length}`);

  let finalLines = lines;

  if (lines.length > maxLines) {
    console.warn(`⚠️ Texto tem ${lines.length} linhas, limitando a ${maxLines}`);

    const truncatedLines = lines.slice(0, maxLines - 1);
    const lastLine = lines.slice(maxLines - 1).join(" ");

    if (lastLine.length > 0) {
      const lastWords = lastLine.split(" ");
      let finalLine = "";

      for (const word of lastWords) {
        const testLine = finalLine.length === 0
          ? word
          : `${finalLine} ${word}`;

        if (testLine.length <= maxCharsPerLine) {
          finalLine = testLine;
        } else {
          break;
        }
      }

      if (finalLine.length > 0) {
        truncatedLines.push(finalLine + "...");
      }
    }

    finalLines = truncatedLines;
  }

  // ============================================
  // JUSTIFICADO - COM MENOS ESPAÇO ENTRE PALAVRAS
  // ============================================

  let finalText = finalLines.join("\n");

  if (align === "justify" && finalLines.length > 0) {
    const justifiedLines: string[] = [];

    for (let i = 0; i < finalLines.length; i++) {
      let line = finalLines[i];

      // Última linha não é justificada
      if (i === finalLines.length - 1) {
        justifiedLines.push(line);
        continue;
      }

      // Se a linha já está no máximo, não precisa justificar
      if (line.length >= maxCharsPerLine) {
        justifiedLines.push(line);
        continue;
      }

      const wordsInLine = line.split(" ");
      const spacesToAdd = maxCharsPerLine - line.length;

      if (wordsInLine.length <= 1) {
        justifiedLines.push(line);
        continue;
      }

      const gaps = wordsInLine.length - 1;

      // CORREÇÃO: Distribuir espaços extras de forma mais uniforme
      // Usamos espaços simples e adicionamos espaços extras apenas onde necessário
      let spacesPerGap = Math.floor(spacesToAdd / gaps);
      let extraSpaces = spacesToAdd % gaps;

      // LIMITAR espaços extras para não ficar muito grande
      // Máximo de 2 espaços extras por gap
      if (spacesPerGap > 2) {
        spacesPerGap = 2;
        extraSpaces = 0;
      }

      let justifiedLine = "";
      for (let j = 0; j < wordsInLine.length; j++) {
        justifiedLine += wordsInLine[j];

        if (j < wordsInLine.length - 1) {
          // Espaço base (1) + espaços extras (limitado)
          let spaceCount = 1 + spacesPerGap;
          if (j < extraSpaces) {
            spaceCount += 1;
          }
          // Garantir que nunca tenha mais que 3 espaços seguidos
          if (spaceCount > 2) {
            spaceCount = 2;
          }
          justifiedLine += " ".repeat(spaceCount);
        }
      }

      justifiedLines.push(justifiedLine);
    }

    finalText = justifiedLines.join("\n");
    console.log("📝 Texto justificado com espaços reduzidos!");
  }

  return {
    text: finalText,
    lines: finalLines,
    maxCharsPerLine,
    align,
    justified: align === "justify",
  };

}