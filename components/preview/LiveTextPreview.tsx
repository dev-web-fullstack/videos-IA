"use client";

import type { TextStyle } from "../../lib/textStyle";
import { buildTextLayout } from "../../lib/textLayout";
import { BackgroundAnimationType, BackgroundPosition } from "../../lib/backgroundAnimations";

interface Props {
  text: string;
  width: number;
  height: number;
  style: TextStyle;
  backgroundAnimation?: BackgroundAnimationType;
  backgroundPosition?: BackgroundPosition;
  backgroundColor?: string;
}

export default function LiveTextPreview({
  text,
  width,
  height,
  style,
  backgroundAnimation = "none",
  backgroundPosition = "full",
  backgroundColor = "#000000",
}: Props) {

  const MAX_WIDTH = 420;
  const MAX_HEIGHT = 300;

  const scale = Math.min(
    MAX_WIDTH / width,
    MAX_HEIGHT / height
  );

  const previewWidth = width * scale;
  const previewHeight = height * scale;

  const layout = buildTextLayout({
    text,
    width,
    height,
    fontSize: style.fontSize,
    marginX: style.marginX,
    align: style.align,
  });

  const bgOpacity = style.backgroundOpacity / 100;
  const bgColor = style.backgroundColor;

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isJustified = style.align === "justify";
  const lines = layout.lines;

  let textAlign: "left" | "center" | "right" = "center";
  switch (style.align) {
    case "left":
      textAlign = "left";
      break;
    case "right":
      textAlign = "right";
      break;
    case "justify":
      textAlign = "left";
      break;
    case "center":
    default:
      textAlign = "center";
      break;
  }

  let verticalAlign: "flex-start" | "center" | "flex-end" = "center";
  switch (style.verticalPosition) {
    case "top":
      verticalAlign = "flex-start";
      break;
    case "bottom":
      verticalAlign = "flex-end";
      break;
    case "center":
    default:
      verticalAlign = "center";
      break;
  }

  const getBackgroundStyle = () => {
    if (backgroundAnimation === "none") {
      return backgroundColor;
    }

    switch (backgroundAnimation) {
      case "gradient-wave":
        return `linear-gradient(45deg, ${backgroundColor}, #ff6b6b, #4ecdc4, ${backgroundColor})`;
      case "particles":
        return `radial-gradient(circle at 20% 50%, ${backgroundColor}, #ff6b6b44)`;
      case "waves":
        return `repeating-linear-gradient(45deg, ${backgroundColor}, #4ecdc444 10px, ${backgroundColor} 20px)`;
      case "geometric-rotate":
        return `conic-gradient(from 0deg, ${backgroundColor}, #ff6b6b, #4ecdc4, ${backgroundColor})`;
      case "light-pulse":
        return `radial-gradient(circle at center, #ffffff22, ${backgroundColor})`;
      default:
        return backgroundColor;
    }
  };

  const getAnimationPosition = () => {
    switch (backgroundPosition) {
      case "top-half":
        return { top: 0, height: "50%" };
      case "center":
        return { top: "25%", height: "50%" };
      case "bottom-half":
        return { top: "50%", height: "50%" };
      case "full":
      default:
        return { top: 0, height: "100%" };
    }
  };

  const animPosition = getAnimationPosition();

  // USAR DIRETAMENTE O NOME DA FONTE SEM MAPEAMENTO
  const fontFamily = style.fontFamily;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        Prévia do vídeo
      </h2>

      <div className="flex justify-center">
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl"
          style={{
            width: previewWidth,
            height: previewHeight,
            backgroundColor: backgroundColor,
          }}
        >
          {backgroundAnimation !== "none" && (
            <div
              className="absolute"
              style={{
                top: animPosition.top,
                left: 0,
                width: "100%",
                height: animPosition.height,
                background: getBackgroundStyle(),
                opacity: 0.5,
                transition: "all 0.5s ease",
              }}
            />
          )}

          <div
            className="absolute inset-0 flex"
            style={{
              alignItems: verticalAlign,
              paddingLeft: style.marginX * scale,
              paddingRight: style.marginX * scale,
              paddingTop: style.marginY * scale,
              paddingBottom: style.marginY * scale,
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: textAlign,
                color: style.color,
                fontFamily: fontFamily,
                fontSize: style.fontSize * scale,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                padding: style.padding * scale * 0.5,
                borderRadius: style.borderRadius * scale * 0.3,
                backgroundColor: style.backgroundOpacity > 0
                  ? hexToRgba(bgColor, bgOpacity)
                  : "transparent",
                WebkitTextStroke: style.borderWidth > 0
                  ? `${style.borderWidth * scale}px ${style.borderColor}`
                  : "none",
                textShadow: style.shadow
                  ? `
                    ${style.shadowX * scale}px
                    ${style.shadowY * scale}px
                    ${style.shadowBlur * scale}px
                    ${style.shadowColor}
                  `
                  : "none",
                lineHeight: 1 + (style.lineSpacing / style.fontSize),
                transition: "all .25s ease",
                position: "relative",
                zIndex: 10,
              }}
            >
              {isJustified ? (
                lines.map((line, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign: "justify",
                      textAlignLast: index === lines.length - 1 ? "left" : "justify",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      width: "100%",
                    }}
                  >
                    {line}
                  </div>
                ))
              ) : (
                layout.text || "Seu texto aparecerá aqui"
              )}
            </div>
          </div>

          {backgroundAnimation !== "none" && (
            <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[8px] text-white/70 border border-white/20">
              🎨 {backgroundAnimation}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        {width} × {height} | {lines.length} linhas
        {backgroundAnimation !== "none" && ` | 🎨 ${backgroundAnimation}`}
        {style.align === "justify" && " | 📐 Justificado"}
        {style.verticalPosition !== "center" && ` | 📍 ${style.verticalPosition === "top" ? "⬆️ Cima" : "⬇️ Baixo"}`}
        <br />
        <span className="text-gray-500">Fonte: {style.fontFamily}</span>
      </div>
    </section>
  );
}