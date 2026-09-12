// components/form/BackgroundSelector.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Palette,
  Check,
  Loader2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  PenLine,
  Dice5,
} from "lucide-react";
import {
  BackgroundType,
  backgroundColors,
  getRandomColor,
  getRandomHexColor,
  getRandomPromptFromTheme,
  getRandomTheme,
  getThemeName,
  backgroundThemes,
  themeKeys,
  generatePollinationsUrl,
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
  onImageChange: (url: string, prompt: string, theme?: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  isGeneratingImage?: boolean;
  selectedTheme?: string;
  onThemeChange?: (theme: string) => void;
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
  selectedTheme = "sunset",
  onThemeChange,
}: BackgroundSelectorProps) {

  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

  useEffect(() => {
    if (isGeneratingImage) {
      setProgress(0);
      setError(null);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isGeneratingImage]);

  // Gerar imagem com tema selecionado
  const handleGenerateAI = async () => {
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    setProgress(0);

    try {
      const prompt = getRandomPromptFromTheme(selectedTheme as keyof typeof backgroundThemes);
      setCurrentPrompt(prompt);

      const url = generatePollinationsUrl(prompt, width, height);

      onTypeChange("ai-generated");
      onImageChange(url, prompt, selectedTheme);

      console.log("🎨 Tema:", getThemeName(selectedTheme));
      console.log("🎨 Prompt:", prompt);
      console.log("🖼️ URL:", url);

    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro ao gerar imagem. Tente novamente.");
      onImageChange("", "", undefined);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Gerar imagem com prompt personalizado
  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) {
      setError("Digite uma descrição para gerar a imagem");
      return;
    }

    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    setProgress(0);

    try {
      const prompt = customPrompt.trim();
      setCurrentPrompt(prompt);

      const url = generatePollinationsUrl(prompt, width, height);

      onTypeChange("ai-generated");
      onImageChange(url, prompt, "custom");

      console.log("🎨 Prompt personalizado:", prompt);
      console.log("🖼️ URL:", url);

    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro ao gerar imagem. Tente novamente.");
      onImageChange("", "", undefined);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  const handleRandomTheme = () => {
    const randomTheme = getRandomTheme();
    if (onThemeChange) {
      onThemeChange(randomTheme);
    }
  };

  const handleRandomCustomPrompt = () => {
    const randomTheme = getRandomTheme();
    const prompt = getRandomPromptFromTheme(randomTheme);
    setCustomPrompt(prompt);
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

  const currentThemeName = getThemeName(selectedTheme);

  // Temas a exibir (todos ou apenas 8 primeiros)
  const visibleThemes = showAllThemes ? themeKeys : themeKeys.slice(0, 8);

  return (
    <div className="space-y-4">

      {/* ============================================ */}
      {/* CAMPO DE PROMPT PERSONALIZADO */}
      {/* ============================================ */}
      <div className="space-y-2">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={isGeneratingImage}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50
            text-xs text-gray-400 hover:text-white transition-all
            ${isGeneratingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="flex items-center gap-2">
            <PenLine className="w-3.5 h-3.5" />
            Criar imagem com IA
          </span>
          {showCustomInput ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showCustomInput && (
          <div className="space-y-2 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-medium">
                Descreva a imagem que deseja criar
              </label>
              <button
                onClick={handleRandomCustomPrompt}
                disabled={isGeneratingImage}
                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Dice5 className="w-3 h-3" />
                Aleatório
              </button>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: paisagem montanhosa com neve ao pôr do sol, cores quentes..."
              disabled={isGeneratingImage}
              className="w-full h-20 rounded-lg bg-gray-800/50 border border-gray-700/50 p-2.5 text-white text-xs placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-500">
                {customPrompt.length} caracteres
              </span>
              <button
                onClick={handleGenerateCustom}
                disabled={isGeneratingImage || !customPrompt.trim()}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isGeneratingImage || !customPrompt.trim()
                    ? "bg-gray-700/50 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/30 text-white"
                  }
                `}
              >
                {isGeneratingImage ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                Gerar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* SEPARADOR */}
      {/* ============================================ */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-700/50" />
        <span className="text-[9px] text-gray-500 uppercase tracking-wider">ou use um tema</span>
        <div className="flex-1 h-px bg-gray-700/50" />
      </div>

      {/* ============================================ */}
      {/* BOTÃO GERAR COM TEMA */}
      {/* ============================================ */}
      <button
        onClick={handleGenerateAI}
        disabled={isGeneratingImage}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
          font-medium text-sm transition-all duration-200
          ${isGeneratingImage
            ? "bg-gray-700/50 cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-white"
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
            <Wand2 className="w-4 h-4" />
            <span>✨ Gerar com Tema</span>
          </>
        )}
      </button>

      {/* ============================================ */}
      {/* BARRA DE PROGRESSO */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* ERRO */}
      {/* ============================================ */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* STATUS DA IMAGEM GERADA */}
      {/* ============================================ */}
      {backgroundType === "ai-generated" && imageUrl && !isGeneratingImage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-300">Imagem gerada!</span>
        </div>
      )}

      {/* ============================================ */}
      {/* SELETOR DE TEMAS */}
      {/* ============================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400 font-medium">
            Temas ({themeKeys.length})
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="text-[10px] text-gray-500 hover:text-white transition-colors"
            >
              {showAllThemes ? 'Ver menos' : 'Ver todos'}
            </button>
            <button
              onClick={handleRandomTheme}
              disabled={isGeneratingImage}
              className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              🎲 Aleatório
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {visibleThemes.map((themeKey) => {
            const theme = backgroundThemes[themeKey];
            const isSelected = selectedTheme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => onThemeChange && onThemeChange(themeKey)}
                disabled={isGeneratingImage}
                className={`
                  text-center p-1.5 rounded-lg border transition-all duration-200 text-[10px]
                  ${isSelected
                    ? "border-purple-400 bg-purple-600/20 text-white"
                    : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                  }
                  ${isGeneratingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                `}
                title={theme.name}
              >
                <div className="text-base">{theme.name.split(' ')[0]}</div>
                <div className="mt-0.5 truncate text-[8px] leading-tight">
                  {theme.name.split(' ').slice(1).join(' ')}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-center text-[10px] text-gray-500">
          Tema atual: <span className="text-purple-300">{currentThemeName}</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* BOTÃO FUNDO SÓLIDO */}
      {/* ============================================ */}
      <button
        onClick={() => {
          onTypeChange("solid");
          onImageChange("", "", undefined);
          setError(null);
          setProgress(0);
          if (onLoadingChange) onLoadingChange(false);
        }}
        disabled={isGeneratingImage}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
          font-medium text-sm transition-all duration-200
          ${isGeneratingImage
            ? "bg-gray-700/50 cursor-not-allowed opacity-60"
            : backgroundType === "solid"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
              : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white"
          }
        `}
      >
        <Palette className="w-4 h-4" />
        <span>Fundo Sólido</span>
      </button>

      {/* ============================================ */}
      {/* CORES DE FUNDO (apenas para sólido) */}
      {/* ============================================ */}
      {backgroundType === "solid" && (
        <div className="space-y-3">
          {/* Cores predefinidas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">
                Cores predefinidas
              </label>
              <button
                onClick={() => onColorChange(getRandomColor())}
                disabled={isGeneratingImage}
                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
              >
                🎲 Aleatório
              </button>
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
          </div>

          {/* Cor personalizada */}
          <div className="space-y-2 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">
                Cor personalizada
              </label>
              <button
                onClick={() => onColorChange(getRandomHexColor())}
                disabled={isGeneratingImage}
                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
              >
                🎲 Aleatória
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onColorChange(e.target.value)}
                disabled={isGeneratingImage}
                className={`
                  w-12 h-12 rounded-lg bg-gray-800/50 border-2 border-gray-700/50 cursor-pointer
                  hover:border-purple-500/50 transition-colors
                  ${isGeneratingImage ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title="Escolher cor personalizada"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      onColorChange(value);
                    }
                  }}
                  disabled={isGeneratingImage}
                  placeholder="#000000"
                  className={`
                    w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 
                    text-white text-sm font-mono focus:border-purple-500/50 focus:outline-none
                    ${isGeneratingImage ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
              </div>
            </div>
            <div className="text-[9px] text-gray-500 text-center">
              Clique no quadrado para escolher ou digite o código hexadecimal
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* PROMPT ATUAL */}
      {/* ============================================ */}
      {backgroundType === "ai-generated" && imageUrl && !isGeneratingImage && currentPrompt && (
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-2">
          <p className="text-[10px] text-blue-300 text-center truncate" title={currentPrompt}>
            📝 {currentPrompt}
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* DICA PARA IA */}
      {/* ============================================ */}
      {backgroundType === "ai-generated" && !imageUrl && !isGeneratingImage && !error && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Escolha um tema ou crie uma imagem personalizada com sua própria descrição.
          </p>
        </div>
      )}
    </div>
  );
}