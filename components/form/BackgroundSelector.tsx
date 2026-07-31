// components/form/BackgroundSelector.tsx
"use client";

import { useState } from "react";
import {
  BackgroundAnimationType,
  BackgroundPosition,
  backgroundColors,
  getRandomBackgroundConfig,
  getRandomAnimation,
  getRandomPosition,
  getRandomColor
} from "../../lib/backgroundAnimations";

interface BackgroundSelectorProps {
  animationType: BackgroundAnimationType;
  position: BackgroundPosition;
  backgroundColor: string;
  onAnimationChange: (type: BackgroundAnimationType) => void;
  onPositionChange: (position: BackgroundPosition) => void;
  onColorChange: (color: string) => void;
}

const animations: { value: BackgroundAnimationType; label: string; icon: string; description: string }[] = [
  { value: "none", label: "Sem animação", icon: "⬛", description: "Fundo sólido" },
  { value: "gradient-wave", label: "Gradiente", icon: "🌈", description: "Cores mudando" },
  { value: "particles", label: "Partículas", icon: "✨", description: "Círculos se movendo" },
  { value: "waves", label: "Ondas", icon: "🌊", description: "Padrão ondulado" },
  { value: "geometric-rotate", label: "Geometria", icon: "🔷", description: "Formas girando" },
  { value: "light-pulse", label: "Pulso de Luz", icon: "💡", description: "Efeito respiração" },
];

const positions: { value: BackgroundPosition; label: string; icon: string }[] = [
  { value: "full", label: "Tela inteira", icon: "▣" },
  { value: "top-half", label: "Topo", icon: "▤" },
  { value: "center", label: "Centro", icon: "◈" },
  { value: "bottom-half", label: "Base", icon: "▥" },
];

export default function BackgroundSelector({
  animationType,
  position,
  backgroundColor,
  onAnimationChange,
  onPositionChange,
  onColorChange,
}: BackgroundSelectorProps) {

  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandom = () => {
    setIsRandomizing(true);

    // Gerar configuração aleatória
    const config = getRandomBackgroundConfig();

    // Aplicar com animação
    onAnimationChange(config.type);
    onPositionChange(config.position);
    onColorChange(config.backgroundColor);

    setTimeout(() => setIsRandomizing(false), 300);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          🎨 Fundo Animado
        </h3>
        <button
          onClick={handleRandom}
          disabled={isRandomizing}
          className={`
            px-4 py-2 rounded-lg font-semibold transition text-sm
            ${isRandomizing
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white"
            }
          `}
        >
          {isRandomizing ? "⏳" : "🎲"} Aleatório
        </button>
      </div>

      {/* Tipos de animação */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">
          Tipo de animação
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {animations.map((anim) => (
            <button
              key={anim.value}
              onClick={() => onAnimationChange(anim.value)}
              className={`
                rounded-lg p-3 text-center transition-all duration-200
                ${animationType === anim.value
                  ? "bg-green-600 text-white border-2 border-green-400 shadow-lg shadow-green-900/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-transparent"
                }
              `}
            >
              <div className="text-2xl">{anim.icon}</div>
              <div className="text-xs font-medium mt-1">{anim.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{anim.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Cor de fundo (para sem animação ou como base) */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">
          Cor de fundo
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
          {backgroundColors.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`
                w-full aspect-square rounded-lg border-2 transition-all
                ${backgroundColor === color.value
                  ? "border-green-400 scale-110"
                  : "border-gray-700 hover:border-gray-500"
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
        <div className="text-xs text-gray-400 text-center">
          Cor atual: <span className="font-mono">{backgroundColor}</span>
        </div>
      </div>

      {/* Posição da animação */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">
          Posição da animação
        </label>
        <div className="grid grid-cols-4 gap-2">
          {positions.map((pos) => (
            <button
              key={pos.value}
              onClick={() => onPositionChange(pos.value)}
              className={`
                rounded-lg p-3 text-center transition-all duration-200
                ${position === pos.value
                  ? "bg-green-600 text-white border-2 border-green-400"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-transparent"
                }
              `}
            >
              <div className="text-xl">{pos.icon}</div>
              <div className="text-xs font-medium mt-1">{pos.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview da posição com cor */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">
          Prévia da posição
        </label>
        <div
          className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-700"
          style={{ backgroundColor }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
            {animationType !== "none" ? (
              <>
                <span className="mr-1">{animations.find(a => a.value === animationType)?.icon}</span>
                <span>{animations.find(a => a.value === animationType)?.label}</span>
              </>
            ) : (
              "Fundo sólido"
            )}
          </div>
          <div
            className={`
              absolute bg-white/20 border-2 border-white/50 transition-all duration-300
              ${position === "full" ? "inset-0" : ""}
              ${position === "top-half" ? "inset-x-0 top-0 h-1/2" : ""}
              ${position === "center" ? "inset-x-0 top-1/4 h-1/2" : ""}
              ${position === "bottom-half" ? "inset-x-0 bottom-0 h-1/2" : ""}
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
              {position === "full" ? "Tela inteira" : ""}
              {position === "top-half" ? "Topo" : ""}
              {position === "center" ? "Centro" : ""}
              {position === "bottom-half" ? "Base" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Informação sobre performance */}
      {animationType !== "none" && (
        <div className="rounded-lg bg-yellow-900/20 border border-yellow-700 p-3">
          <p className="text-xs text-yellow-300">
            ⚡ Animações podem aumentar o tempo de renderização.
            <br />
            Recomendado para vídeos curtos (até 30 segundos).
          </p>
        </div>
      )}
    </section>
  );
}