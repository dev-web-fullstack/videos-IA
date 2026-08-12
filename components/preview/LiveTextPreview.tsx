"use client";

import { useState, useEffect, useRef } from "react";
import type { TextStyle } from "../../lib/textStyle";
import { buildTextLayout } from "../../lib/textLayout";
import { BackgroundType } from "../../lib/backgroundAnimations";

interface Props {
  text: string;
  width: number;
  height: number;
  style: TextStyle;
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundImage?: string;
  isGeneratingImage?: boolean;
  onImageDisplayed?: () => void;
}

export default function LiveTextPreview({
  text,
  width,
  height,
  style,
  backgroundType = "solid",
  backgroundColor = "#000000",
  backgroundImage,
  isGeneratingImage = false,
  onImageDisplayed,
}: Props) {

  const MAX_WIDTH = 420;
  const MAX_HEIGHT = 300;
  const [imageDisplayed, setImageDisplayed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onImageDisplayedRef = useRef(onImageDisplayed);
  const isMounted = useRef(true);

  // Manter a referência do callback atualizada
  useEffect(() => {
    onImageDisplayedRef.current = onImageDisplayed;
  }, [onImageDisplayed]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

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

  const isImageBackground = backgroundType === "ai-generated" && backgroundImage;

  // CARREGAR IMAGEM - CORRIGIDO
  useEffect(() => {
    // Resetar estado
    setImageDisplayed(false);

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Se não for imagem ou estiver gerando, não fazer nada
    if (!isImageBackground || isGeneratingImage || !backgroundImage) {
      setImageDisplayed(false);
      return;
    }

    // Criar imagem para teste
    const img = new (window as any).Image();

    const handleLoad = () => {
      if (isMounted.current) {
        setImageDisplayed(true);
        if (onImageDisplayedRef.current) {
          onImageDisplayedRef.current();
        }
      }
    };

    const handleError = () => {
      // Se der erro, tentar novamente após 1s
      if (isMounted.current) {
        timeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setImageDisplayed(true);
            if (onImageDisplayedRef.current) {
              onImageDisplayedRef.current();
            }
          }
        }, 1000);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = backgroundImage;

    // Se a imagem já estiver carregada
    if (img.complete) {
      handleLoad();
    } else {
      // Timeout de segurança
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && !imageDisplayed) {
          setImageDisplayed(true);
          if (onImageDisplayedRef.current) {
            onImageDisplayedRef.current();
          }
        }
      }, 5000);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [backgroundImage, isGeneratingImage, isImageBackground]);

  // Quando a imagem é gerada, notificar
  useEffect(() => {
    if (!isGeneratingImage && isImageBackground && backgroundImage) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setImageDisplayed(true);
          if (onImageDisplayedRef.current) {
            onImageDisplayedRef.current();
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingImage, isImageBackground, backgroundImage]);

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
          {/* Fundo com imagem */}
          {isImageBackground && !isGeneratingImage && (
            <div className="absolute inset-0 w-full h-full">
              <img
                ref={imgRef}
                src={backgroundImage}
                alt="Fundo gerado por IA"
                className="w-full h-full object-cover"
                onLoad={() => {
                  if (isMounted.current) {
                    setImageDisplayed(true);
                    if (onImageDisplayedRef.current) {
                      onImageDisplayedRef.current();
                    }
                  }
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  if (isMounted.current) {
                    setTimeout(() => {
                      setImageDisplayed(true);
                      if (onImageDisplayedRef.current) {
                        onImageDisplayedRef.current();
                      }
                    }, 500);
                  }
                }}
              />
            </div>
          )}

          {/* Placeholder de carregamento */}
          {isGeneratingImage && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-pulse">🎨</div>
                <div className="text-sm text-white/80 font-medium">Gerando imagem...</div>
                <div className="text-xs text-white/50 mt-1">Aguarde, isso pode levar alguns segundos</div>
              </div>
            </div>
          )}

          {/* Área do texto */}
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
                fontFamily: style.fontFamily,
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

          {/* Indicador do tipo de fundo */}
          {!isGeneratingImage && (
            <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[8px] text-white/70 border border-white/20 z-20">
              {isImageBackground ? "🎨 IA" : "⬛ Sólido"}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        {width} × {height} | {lines.length} linhas
        {isImageBackground && !isGeneratingImage && " | 🎨 Fundo gerado por IA"}
        {isGeneratingImage && " | ⏳ Gerando imagem..."}
        {style.align === "justify" && " | 📐 Justificado"}
        {style.verticalPosition !== "center" && ` | 📍 ${style.verticalPosition === "top" ? "⬆️ Cima" : "⬇️ Baixo"}`}
        <br />
        <span className="text-gray-500">Fonte: {style.fontFamily}</span>
      </div>
    </section>
  );
}