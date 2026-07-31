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

  // Área útil
  const usableWidth = width - marginX * 2;

  // Estimativa de largura dos caracteres
  const averageCharWidth = fontSize * 0.6;
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

      // Se a palavra é muito longa, quebrar ela mesma
      if (word.length > maxCharsPerLine) {
        let remaining = word;
        while (remaining.length > 0) {
          const chunk = remaining.slice(0, maxCharsPerLine);
          remaining = remaining.slice(maxCharsPerLine);
          lines.push(chunk);
          if (remaining.length > 0) {
            // Continuar na próxima linha
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

    // Manter apenas as primeiras linhas e adicionar "..."
    const truncatedLines = lines.slice(0, maxLines - 1);
    const lastLine = lines.slice(maxLines - 1).join(" ");

    if (lastLine.length > 0) {
      // Tentar colocar o restante na última linha
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

  //--------------------------------------------------
  // SE FOR JUSTIFICADO, processar linhas
  //--------------------------------------------------

  let finalText = finalLines.join("\n");

  if (align === "justify" && finalLines.length > 0) {
    // Para justificar, adicionamos espaços extras entre palavras
    // para que cada linha ocupe exatamente o máximo de caracteres
    const justifiedLines: string[] = [];

    for (let i = 0; i < finalLines.length; i++) {
      let line = finalLines[i];

      // Última linha não é justificada (mantém alinhamento à esquerda)
      if (i === finalLines.length - 1) {
        justifiedLines.push(line);
        continue;
      }

      // Se a linha já está no máximo, não precisa justificar
      if (line.length >= maxCharsPerLine) {
        justifiedLines.push(line);
        continue;
      }

      // Calcular quantos espaços extras precisamos adicionar
      const wordsInLine = line.split(" ");
      const spacesToAdd = maxCharsPerLine - line.length;

      if (wordsInLine.length <= 1) {
        // Linha com uma única palavra não pode ser justificada
        justifiedLines.push(line);
        continue;
      }

      // Distribuir espaços extras entre as palavras
      const gaps = wordsInLine.length - 1;
      const spacesPerGap = Math.floor(spacesToAdd / gaps);
      const extraSpaces = spacesToAdd % gaps;

      // Construir linha justificada
      let justifiedLine = "";
      for (let j = 0; j < wordsInLine.length; j++) {
        justifiedLine += wordsInLine[j];

        // Adicionar espaços entre as palavras
        if (j < wordsInLine.length - 1) {
          // Espaço base (1) + espaços extras
          let spaceCount = 1 + spacesPerGap;
          // Distribuir espaços extras restantes
          if (j < extraSpaces) {
            spaceCount += 1;
          }
          justifiedLine += " ".repeat(spaceCount);
        }
      }

      justifiedLines.push(justifiedLine);
    }

    finalText = justifiedLines.join("\n");
    console.log("📝 Texto justificado aplicado!");
  }

  return {
    text: finalText,
    lines: finalLines,
    maxCharsPerLine,
    align,
    justified: align === "justify",
  };

}