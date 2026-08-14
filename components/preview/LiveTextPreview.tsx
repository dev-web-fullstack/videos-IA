"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TextStyle } from "../../lib/textStyle";
import { buildTextLayout } from "../../lib/textLayout";
import { BackgroundType } from "../../lib/backgroundAnimations";

interface ImageOverlay {
  path: string;
  position: { x: number; y: number };
  size: number;
  aspectRatio?: number; // NOVO: guardar a proporção da imagem
}

interface Props {
  text: string;
  width: number;
  height: number;
  style: TextStyle;
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundImage?: string;
  overlayImages?: ImageOverlay[];
  onOverlayImagesChange?: (images: ImageOverlay[]) => void;
  isGeneratingImage?: boolean;
  onImageDisplayed?: () => void;
  activeTab?: string;
}

export default function LiveTextPreview({
  text,
  width,
  height,
  style,
  backgroundType = "solid",
  backgroundColor = "#000000",
  backgroundImage,
  overlayImages = [],
  onOverlayImagesChange,
  isGeneratingImage = false,
  onImageDisplayed,
  activeTab = "text",
}: Props) {

  const MAX_WIDTH = 420;
  const MAX_HEIGHT = 300;
  const [imageDisplayed, setImageDisplayed] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onImageDisplayedRef = useRef(onImageDisplayed);
  const isMounted = useRef(true);
  const isImageLoadedRef = useRef(false);
  const loadAttemptsRef = useRef(0);

  // Calcular proporção da imagem ao adicionar
  const getImageAspectRatio = (imagePath: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = () => {
        resolve(1); // fallback para quadrado
      };
      img.src = imagePath;
    });
  };

  // Quando uma imagem é adicionada, calcular sua proporção
  useEffect(() => {
    if (overlayImages.length > 0) {
      // Verificar se alguma imagem não tem proporção definida
      const needRatio = overlayImages.some(img => !img.aspectRatio);
      if (needRatio) {
        const updatedImages = Promise.all(
          overlayImages.map(async (img) => {
            if (img.aspectRatio) return img;
            const ratio = await getImageAspectRatio(img.path);
            return { ...img, aspectRatio: ratio };
          })
        );
        updatedImages.then((newImages) => {
          if (onOverlayImagesChange) {
            onOverlayImagesChange(newImages);
          }
        });
      }
    }
  }, [overlayImages, onOverlayImagesChange]);

  const showPlaceholder = activeTab === "text" && (!text || text.trim().length === 0);

  const displayText = text && text.trim().length > 0
    ? text
    : (activeTab === "text" ? "Seu texto aparecerá aqui" : "");

  const hasTextContent = displayText && displayText.trim().length > 0;

  useEffect(() => {
    onImageDisplayedRef.current = onImageDisplayed;
  }, [onImageDisplayed]);

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

  const layout = text && text.trim().length > 0
    ? buildTextLayout({
      text,
      width,
      height,
      fontSize: style.fontSize,
      marginX: style.marginX,
      align: style.align,
    })
    : { text: displayText, lines: [], maxCharsPerLine: 0, align: style.align };

  const bgOpacity = style.backgroundOpacity / 100;
  const bgColor = style.backgroundColor;

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isJustified = style.align === "justify";
  const lines = layout.lines || [];

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
  const hasOverlays = overlayImages.length > 0;

  // Carregar imagem de fundo
  useEffect(() => {
    setImageDisplayed(false);
    isImageLoadedRef.current = false;
    loadAttemptsRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isImageBackground || isGeneratingImage || !backgroundImage) {
      setImageDisplayed(false);
      return;
    }

    const img = new (window as any).Image();
    let isLoaded = false;

    const handleLoad = () => {
      if (isMounted.current && !isLoaded) {
        isLoaded = true;
        isImageLoadedRef.current = true;
        setImageDisplayed(true);
        if (onImageDisplayedRef.current) {
          onImageDisplayedRef.current();
        }
      }
    };

    const handleError = () => {
      if (isMounted.current && !isLoaded) {
        loadAttemptsRef.current += 1;
        if (loadAttemptsRef.current < 3) {
          timeoutRef.current = setTimeout(() => {
            if (isMounted.current && !isLoaded) {
              img.src = backgroundImage;
            }
          }, 1000);
        } else {
          isLoaded = true;
          isImageLoadedRef.current = true;
          setImageDisplayed(true);
          if (onImageDisplayedRef.current) {
            onImageDisplayedRef.current();
          }
        }
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = backgroundImage;

    if (img.complete) {
      handleLoad();
    } else {
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && !isLoaded) {
          isLoaded = true;
          isImageLoadedRef.current = true;
          setImageDisplayed(true);
          if (onImageDisplayedRef.current) {
            onImageDisplayedRef.current();
          }
        }
      }, 8000);
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

  useEffect(() => {
    if (!isGeneratingImage && isImageBackground && backgroundImage && !isImageLoadedRef.current) {
      const timer = setTimeout(() => {
        if (isMounted.current && !isImageLoadedRef.current) {
          isImageLoadedRef.current = true;
          setImageDisplayed(true);
          if (onImageDisplayedRef.current) {
            onImageDisplayedRef.current();
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingImage, isImageBackground, backgroundImage]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedIndex(index);
    setDraggingIndex(index);

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedIndex(index);
    setResizingIndex(index);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize(overlayImages[index]?.size || 40);
  }, [overlayImages]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    if (draggingIndex !== null && overlayImages[draggingIndex]) {
      const img = overlayImages[draggingIndex];
      const containerSize = Math.min(containerWidth, containerHeight);
      const sizePx = (img.size / 100) * containerSize;

      let x = ((e.clientX - containerRect.left - dragOffset.x) / containerWidth) * 100;
      let y = ((e.clientY - containerRect.top - dragOffset.y) / containerHeight) * 100;

      const sizePercentX = (sizePx / containerWidth) * 100;
      const sizePercentY = (sizePx / containerHeight) * 100;

      const minX = -500;
      const maxX = 500 - sizePercentX;
      const minY = -500;
      const maxY = 500 - sizePercentY;

      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));

      const updatedImages = overlayImages.map((img, i) => {
        if (i === draggingIndex) {
          return { ...img, position: { x, y } };
        }
        return img;
      });

      if (onOverlayImagesChange) {
        onOverlayImagesChange(updatedImages);
      }
    }

    if (resizingIndex !== null && overlayImages[resizingIndex]) {
      const delta = (e.clientX - resizeStartPos.x + e.clientY - resizeStartPos.y) / 3;
      let newSize = Math.max(5, resizeStartSize + delta * 0.8);
      newSize = Math.min(500, newSize);

      const updatedImages = overlayImages.map((img, i) => {
        if (i === resizingIndex) {
          return { ...img, size: newSize };
        }
        return img;
      });

      if (onOverlayImagesChange) {
        onOverlayImagesChange(updatedImages);
      }
    }
  }, [draggingIndex, resizingIndex, overlayImages, dragOffset, resizeStartPos, resizeStartSize, onOverlayImagesChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
    setResizingIndex(null);
  }, []);

  useEffect(() => {
    if (draggingIndex !== null || resizingIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIndex, resizingIndex, handleMouseMove, handleMouseUp]);

  const handleSelectOverlay = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
        <span>Prévia do vídeo</span>
        {hasOverlays && (
          <span className="text-xs font-normal text-gray-400">
            ({overlayImages.length} imagem(ns) • Clique para selecionar • Arraste para mover • Bordas para redimensionar)
          </span>
        )}
        {!hasTextContent && activeTab === "text" && (
          <span className="text-xs font-normal text-yellow-400">
            ⚠️ Sem texto (placeholder exibido)
          </span>
        )}
      </h2>

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl"
          style={{
            width: previewWidth,
            height: previewHeight,
            backgroundColor: backgroundColor,
          }}
        >
          {isImageBackground && !isGeneratingImage && backgroundImage && (
            <div className="absolute inset-0 w-full h-full">
              <img
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
                }}
              />
            </div>
          )}

          {isGeneratingImage && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-pulse">🎨</div>
                <div className="text-sm text-white/80 font-medium">Gerando imagem...</div>
                <div className="text-xs text-white/50 mt-1">Aguarde, isso pode levar alguns segundos</div>
              </div>
            </div>
          )}

          {overlayImages.map((img, index) => {
            const isSelected = selectedIndex === index;
            const isDragging = draggingIndex === index;
            const containerSize = Math.min(previewWidth, previewHeight);
            const sizePx = (img.size / 100) * containerSize;
            const aspectRatio = img.aspectRatio || 1;

            // Calcular dimensões mantendo proporção
            let displayWidth = sizePx;
            let displayHeight = sizePx / aspectRatio;

            // Se a altura for maior que a largura, ajustar
            if (displayHeight > sizePx) {
              displayHeight = sizePx;
              displayWidth = sizePx * aspectRatio;
            }

            return (
              <div
                key={`${img.path}-${index}`}
                className={`absolute ${isDragging ? 'z-20' : isSelected ? 'z-10' : 'z-5'}`}
                style={{
                  left: `${img.position.x}%`,
                  top: `${img.position.y}%`,
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  transform: 'translate(0, 0)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onClick={() => handleSelectOverlay(index)}
              >
                <img
                  src={img.path}
                  alt={`Imagem ${index + 1}`}
                  className={`w-full h-full object-contain rounded-lg shadow-lg transition-all
                    ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : 'border border-white/10'}
                    ${isDragging ? 'opacity-90' : 'opacity-100'}
                  `}
                  draggable={false}
                />

                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-green-400/80 rounded-full border-2 border-white 
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}
                    transition-opacity`}
                  style={{ transform: 'translate(50%, 50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, index)}
                  onClick={(e) => e.stopPropagation()}
                />

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full px-1.5 py-0.5 text-[8px] text-white font-medium">
                    ✓
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 rounded px-1.5 py-0.5 text-[8px] text-white whitespace-nowrap">
                    {Math.round(img.size)}% | {aspectRatio.toFixed(2)}:1
                  </div>
                )}
              </div>
            );
          })}

          {hasTextContent || showPlaceholder ? (
            <div
              className="absolute inset-0 flex"
              style={{
                alignItems: verticalAlign,
                paddingLeft: style.marginX * scale,
                paddingRight: style.marginX * scale,
                paddingTop: style.marginY * scale,
                paddingBottom: style.marginY * scale,
                zIndex: 10,
                pointerEvents: 'none',
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
                  pointerEvents: 'none',
                }}
              >
                {isJustified && lines.length > 0 ? (
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
                  displayText || "Seu texto aparecerá aqui"
                )}
              </div>
            </div>
          ) : null}

          {!isGeneratingImage && (
            <>
              <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[8px] text-white/70 border border-white/20 z-20">
                {isImageBackground && imageDisplayed ? "🎨 IA" : "⬛ Sólido"}
                {hasOverlays && ` 📷 ${overlayImages.length}`}
              </div>
              {hasOverlays && (
                <div className="absolute top-2 right-2 bg-green-500/80 rounded-full px-1.5 py-0.5 text-[8px] text-white z-20">
                  {selectedIndex !== null ? `Selecionado #${selectedIndex + 1}` : `${overlayImages.length} imagens`}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400">
        {width} × {height} | {lines.length} linhas
        {isImageBackground && imageDisplayed && !isGeneratingImage && " | 🎨 Fundo gerado por IA"}
        {hasOverlays && !isGeneratingImage && ` | 📷 ${overlayImages.length} imagem(ns)`}
        {isGeneratingImage && " | ⏳ Gerando imagem..."}
        {style.align === "justify" && " | 📐 Justificado"}
        {style.verticalPosition !== "center" && ` | 📍 ${style.verticalPosition === "top" ? "⬆️ Cima" : "⬇️ Baixo"}`}
        {selectedIndex !== null && hasOverlays && ` | Selecionada: ${selectedIndex + 1}`}
        <br />
        <span className="text-gray-500">Fonte: {style.fontFamily}</span>
      </div>
    </section>
  );
}