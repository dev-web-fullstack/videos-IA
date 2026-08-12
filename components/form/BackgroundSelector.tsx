// components/form/BackgroundSelector.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Palette,
  Check,
  Loader2,
  AlertCircle,
  Wand2,
} from "lucide-react";
import {
  BackgroundType,
  backgroundColors,
  getRandomColor,
  generatePollinationsUrlFromText,
} from "../../lib/backgroundAnimations";

interface BackgroundSelectorProps {
  backgroundType: BackgroundType;
  backgroundColor: string;
  imageUrl?: string;
  width: number;
  height: number;
  scriptText: string;
  onTypeChange: (type: BackgroundType) => void;
  onColorChange: (color: string) => void;
  onImageChange: (url: string, prompt: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  isGeneratingImage?: boolean;
}

export default function BackgroundSelector({
  backgroundType,
  backgroundColor,
  imageUrl,
  width,
  height,
  scriptText,
  onTypeChange,
  onColorChange,
  onImageChange,
  onLoadingChange,
  isGeneratingImage = false,
}: BackgroundSelectorProps) {

  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Simular progresso enquanto gera - CORRIGIDO
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isGeneratingImage) {
      setProgress(0);
      setError(null);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8;
        });
      }, 200);
    } else {
      // Quando para de gerar, definir progresso como 100 apenas se for > 0
      // e se o componente ainda estiver montado
      if (isMounted.current) {
        setProgress(100);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGeneratingImage]);

  const handleGenerateAI = async () => {
    if (!scriptText || scriptText.trim().length === 0) {
      setError("❌ Digite um texto no vídeo primeiro!");
      return;
    }

    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    setProgress(0);

    try {
      const url = generatePollinationsUrlFromText(scriptText, width, height);
      const promptMatch = url.match(/\/prompt\/([^?]+)/);
      const prompt = promptMatch ? decodeURIComponent(promptMatch[1]) : "Prompt gerado";
      onTypeChange("ai-generated");
      onImageChange(url, prompt);

      console.log("🎨 Prompt:", prompt);
      console.log("🖼️ URL:", url);
      console.log(`📐 Resolução: ${width}x${height}`);

    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro ao gerar imagem. Tente novamente.");
      onImageChange("", "");
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const getStatusMessage = () => {
    if (isGeneratingImage) {
      if (progress < 30) return "🔄 Inicializando...";
      if (progress < 60) return "🎨 Criando sua imagem...";
      if (progress < 90) return "✨ Finalizando detalhes...";
      return "📦 Quase pronto...";
    }
    return null;
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
          <h3 className="text-sm font-semibold text-white">
            Fundo do Vídeo
          </h3>
        </div>
        <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">
          {width}×{height}
        </span>
      </div>

      {/* Status da imagem */}
      {backgroundType === "ai-generated" && imageUrl && !isGeneratingImage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-300">Imagem gerada!</span>
        </div>
      )}

      {/* Barra de progresso */}
      {isGeneratingImage && (
        <div className="space-y-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs text-purple-300 font-medium">
                Gerando imagem...
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-purple-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-400 text-center">
            {getStatusMessage()}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">{error}</span>
        </div>
      )}

      {/* Botões */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleGenerateAI}
          disabled={isGeneratingImage}
          className={`
            group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            font-medium text-sm transition-all duration-200
            ${isGeneratingImage
              ? "bg-gray-700/50 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 text-white"
            }
          `}
        >
          {isGeneratingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Gerar com IA</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            onTypeChange("solid");
            onImageChange("", "");
            setError(null);
            setProgress(0);
            if (onLoadingChange) onLoadingChange(false);
          }}
          disabled={isGeneratingImage}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            font-medium text-sm transition-all duration-200
            ${isGeneratingImage
              ? "bg-gray-700/50 cursor-not-allowed opacity-60"
              : backgroundType === "solid"
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white"
            }
          `}
        >
          <Palette className="w-4 h-4" />
          <span>Sólido</span>
        </button>
      </div>

      {/* Cores (apenas sólido) */}
      {backgroundType === "solid" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">
              Cores disponíveis
            </label>
            <span className="text-[10px] text-gray-500">
              {backgroundColors.length} cores
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                disabled={isGeneratingImage}
                className={`
                  group relative w-full aspect-square rounded-lg border-2 transition-all duration-200
                  ${isGeneratingImage
                    ? "cursor-not-allowed opacity-50"
                    : backgroundColor === color.value
                      ? "border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20"
                      : "border-gray-700 hover:border-gray-500 hover:scale-105"
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.label}
              >
                {backgroundColor === color.value && (
                  <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              Cor atual: <span className="font-mono text-gray-400">{backgroundColor}</span>
            </span>
            <button
              onClick={() => onColorChange(getRandomColor())}
              disabled={isGeneratingImage}
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              Aleatório
            </button>
          </div>
        </div>
      )}

      {/* Dica */}
      {backgroundType === "ai-generated" && !imageUrl && !isGeneratingImage && !error && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            A imagem será gerada automaticamente com base no texto do vídeo.
          </p>
        </div>
      )}
    </div>
  );
}