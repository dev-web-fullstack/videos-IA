// components/preview/LiveTextPreview.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TextStyle } from "../../lib/textStyle";
import { buildTextLayout } from "../../lib/textLayout";
import { BackgroundType } from "../../lib/backgroundAnimations";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

interface ImageOverlay {
  path: string;
  position: { x: number; y: number };
  size: number;
  aspectRatio?: number;
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
  audioPath?: string;
  videoDuration?: number;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  currentTime?: number;
  isPlaying?: boolean;
  onTimeChange?: (time: number) => void;
  onPlayToggle?: () => void;
  disabled?: boolean;
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
  audioPath,
  videoDuration = 5,
  onDurationChange,
  onPlayStateChange,
  currentTime = 0,
  isPlaying = false,
  onTimeChange,
  onPlayToggle,
  disabled = false,
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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioDuration, setAudioDuration] = useState(videoDuration);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onImageDisplayedRef = useRef(onImageDisplayed);
  const isMounted = useRef(true);
  const isImageLoadedRef = useRef(false);
  const loadAttemptsRef = useRef(0);

  const showPlaceholder = activeTab === "text" && (!text || text.trim().length === 0);
  const displayText = text && text.trim().length > 0
    ? text
    : (activeTab === "text" ? "Seu texto aparecerá aqui" : "");
  const hasTextContent = displayText && displayText.trim().length > 0;
  const hasAudio = audioPath && audioPath.trim().length > 0;

  // Atualizar duração quando receber do parent
  useEffect(() => {
    if (onDurationChange && videoDuration > 0) {
      setAudioDuration(videoDuration);
    }
  }, [videoDuration, onDurationChange]);

  useEffect(() => {
    onImageDisplayedRef.current = onImageDisplayed;
  }, [onImageDisplayed]);

  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================

  const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
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
    case "left": textAlign = "left"; break;
    case "right": textAlign = "right"; break;
    case "justify": textAlign = "left"; break;
    default: textAlign = "center"; break;
  }

  let verticalAlign: "flex-start" | "center" | "flex-end" = "center";
  switch (style.verticalPosition) {
    case "top": verticalAlign = "flex-start"; break;
    case "bottom": verticalAlign = "flex-end"; break;
    default: verticalAlign = "center"; break;
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

  // DRAG E RESIZE DAS IMAGENS
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIndex(index);
    setDraggingIndex(index);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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
      const sizePx = (img.size / 100) * Math.min(containerWidth, containerHeight);
      let x = ((e.clientX - containerRect.left - dragOffset.x) / containerWidth) * 100;
      let y = ((e.clientY - containerRect.top - dragOffset.y) / containerHeight) * 100;
      const sizePercentX = (sizePx / containerWidth) * 100;
      const sizePercentY = (sizePx / containerHeight) * 100;
      const minX = -500, maxX = 500 - sizePercentX;
      const minY = -500, maxY = 500 - sizePercentY;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      const updatedImages = overlayImages.map((img, i) => {
        if (i === draggingIndex) return { ...img, position: { x, y } };
        return img;
      });
      if (onOverlayImagesChange) onOverlayImagesChange(updatedImages);
    }

    if (resizingIndex !== null && overlayImages[resizingIndex]) {
      const delta = (e.clientX - resizeStartPos.x + e.clientY - resizeStartPos.y) / 3;
      let newSize = Math.max(5, resizeStartSize + delta * 0.8);
      newSize = Math.min(500, newSize);
      const updatedImages = overlayImages.map((img, i) => {
        if (i === resizingIndex) return { ...img, size: newSize };
        return img;
      });
      if (onOverlayImagesChange) onOverlayImagesChange(updatedImages);
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

  const displayDuration = hasAudio && audioDuration > 0 ? audioDuration : videoDuration;
  const displayTime = hasAudio ? currentTime : 0;
  const playerEnabled = hasAudio && !disabled;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
          <span>Prévia do vídeo</span>
          {hasOverlays && <span className="text-xs text-gray-400">({overlayImages.length} imagem(ns))</span>}
          {hasAudio && audioDuration > 0 && (
            <span className="text-xs text-pink-400 flex items-center gap-1">
              <Music className="w-3 h-3" />
              {formatTime(audioDuration)}
            </span>
          )}
          {disabled && (
            <span className="text-xs text-yellow-400 animate-pulse flex items-center gap-1">
              ⏳ Processando...
            </span>
          )}
        </h2>
      </div>

      {/* PREVIEW DO VÍDEO */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className={`relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl ${disabled ? 'opacity-60' : ''}`}
          style={{ width: previewWidth, height: previewHeight, backgroundColor }}
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
                    if (onImageDisplayedRef.current) onImageDisplayedRef.current();
                  }
                }}
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            </div>
          )}

          {isGeneratingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-pulse">🎨</div>
                <div className="text-sm text-white/80 font-medium">Gerando imagem...</div>
              </div>
            </div>
          )}

          {/* Overlays */}
          {overlayImages.map((img, index) => {
            const isSelected = selectedIndex === index;
            const isDragging = draggingIndex === index;
            const containerSize = Math.min(previewWidth, previewHeight);
            const sizePx = (img.size / 100) * containerSize;
            const aspectRatio = img.aspectRatio || 1;
            let displayWidth = sizePx;
            let displayHeight = sizePx / aspectRatio;
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
                  className={`w-full h-full object-contain rounded-lg shadow-lg transition-all ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : 'border border-white/10'
                    } ${isDragging ? 'opacity-90' : 'opacity-100'}`}
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

          {/* Texto */}
          {(hasTextContent || showPlaceholder) && (
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
          )}

          {!isGeneratingImage && (
            <div className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-0.5 text-[8px] text-white/70 border border-white/20 z-20">
              {isImageBackground && imageDisplayed ? "🎨 IA" : "⬛ Sólido"}
              {hasOverlays && ` 📷 ${overlayImages.length}`}
              {hasAudio && " 🔊"}
            </div>
          )}
        </div>
      </div>

      {/* PLAYER DO VÍDEO - DESABILITADO QUANDO disabled */}
      {!isGeneratingImage && (
        <div className="flex justify-center">
          <div className={`flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 shadow-xl w-full max-w-[90%] min-w-[280px] ${disabled ? 'opacity-50' : ''}`}>
            <button
              onClick={onPlayToggle}
              disabled={!playerEnabled || disabled}
              className={`p-1.5 rounded-full transition-all ${!playerEnabled || disabled
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:text-purple-400 hover:bg-white/10'
                }`}
              title={!playerEnabled ? "Nenhum áudio" : disabled ? "Processando..." : isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <span className="text-xs font-mono text-white/80 min-w-[40px]">{formatTime(displayTime)}</span>

            <div
              className={`flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden ${playerEnabled && !disabled ? 'cursor-pointer' : 'cursor-default'} relative group min-w-[60px]`}
              onClick={playerEnabled && !disabled ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const newTime = x * displayDuration;
                if (onTimeChange && !isNaN(newTime) && isFinite(newTime) && newTime >= 0) {
                  onTimeChange(newTime);
                }
              } : undefined}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
                style={{
                  width: displayDuration > 0 ? `${(displayTime / displayDuration) * 100}%` : '0%'
                }}
              />
              {playerEnabled && !disabled && (
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-full" />
              )}
            </div>

            <span className="text-xs font-mono text-white/60 min-w-[40px]">
              {formatTime(displayDuration)}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!playerEnabled || disabled}
                className={`p-1 rounded-full ${!playerEnabled || disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                }}
                disabled={!playerEnabled || disabled}
                className={`w-12 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-400 ${!playerEnabled || disabled ? 'opacity-50' : ''
                  }`}
                style={{
                  background: playerEnabled && !disabled
                    ? `linear-gradient(to right, #a855f7 0%, #a855f7 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    : '#374151'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="text-center text-xs text-gray-400">
        {width} × {height} | {lines.length} linhas
        {isImageBackground && imageDisplayed && !isGeneratingImage && " | 🎨 Fundo gerado por IA"}
        {hasOverlays && !isGeneratingImage && ` | 📷 ${overlayImages.length} imagem(ns)`}
        {hasAudio && audioDuration > 0 && !isGeneratingImage && ` | 🔊 Com áudio (${formatTime(audioDuration)})`}
        {isGeneratingImage && " | ⏳ Gerando imagem..."}
        {style.align === "justify" && " | 📐 Justificado"}
        {style.verticalPosition !== "center" && ` | 📍 ${style.verticalPosition === "top" ? "⬆️ Cima" : "⬇️ Baixo"}`}
        {selectedIndex !== null && hasOverlays && ` | Selecionada: ${selectedIndex + 1}`}
        <br />
        <span className="text-gray-500">Fonte: {style.fontFamily}</span>
        {!hasAudio && <span className="text-gray-500 ml-1">| Sem áudio</span>}
        {disabled && <span className="text-yellow-400 ml-1">| Processando...</span>}
      </div>
    </section>
  );
}