// components/form/TextStyleEditor.tsx
"use client";

import { useState } from "react";
import {
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  Minus,
  Bold,
  Sparkles,
  Layers,
  CircleDot,
  Sun,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import type {
  TextStyle,
  TextAlign,
  TextVerticalPosition,
} from "../../lib/textStyle";

interface Props {
  value: TextStyle;
  onChange: (style: TextStyle) => void;
  showStyle?: boolean;
  showShadow?: boolean;
  disabled?: boolean;
  hasText?: boolean;
}

const fontOptions = [
  { value: "Roboto-Regular", label: "Roboto" },
  { value: "OpenSans-Regular", label: "Open Sans" },
  { value: "Montserrat-Regular", label: "Montserrat" },
  { value: "Lato-Regular", label: "Lato" },
  { value: "Inter-Regular", label: "Inter" },
  { value: "Poppins-Regular", label: "Poppins" },
  { value: "Nunito-Regular", label: "Nunito" },
  { value: "Quicksand-Regular", label: "Quicksand" },
  { value: "Raleway-Regular", label: "Raleway" },
  { value: "Oswald-Regular", label: "Oswald" },
];

// Paleta de cores rápidas
const quickColors = [
  "#FFFFFF", "#000000", "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E", "#78716C"
];

const alignIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

export default function TextStyleEditor({
  value,
  onChange,
  showStyle = true,
  showShadow = true,
  disabled = false,
  hasText = false,
}: Props) {

  const isDisabled = disabled || !hasText;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showShadowOptions, setShowShadowOptions] = useState(false);

  function update<K extends keyof TextStyle>(
    key: K,
    newValue: TextStyle[K]
  ) {
    if (!isDisabled) {
      onChange({
        ...value,
        [key]: newValue,
      });
    }
  }

  const resetDefaults = () => {
    if (!isDisabled) {
      onChange({
        ...value,
        borderWidth: 0,
        backgroundOpacity: 0,
        shadow: false,
        shadowBlur: 8,
        shadowX: 4,
        shadowY: 4,
      });
    }
  };

  const inputClass = `
    w-full px-2.5 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 
    text-white text-xs focus:border-purple-500/50 focus:outline-none
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const labelClass = "text-[10px] text-gray-400 font-medium";

  if (!showStyle) return null;

  return (
    <div className="space-y-3">

      {/* ============================================ */}
      {/* LINHA 1: FONTE + TAMANHO */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Fonte</label>
          <select
            value={value.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value)}
            disabled={isDisabled}
            className={inputClass}
          >
            {fontOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tamanho</label>
          <input
            type="number"
            min={18}
            max={300}
            value={value.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
            disabled={isDisabled}
            className={inputClass}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* LINHA 2: COR DO TEXTO + PALETA RÁPIDA */}
      {/* ============================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Cor do texto</label>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-500 font-mono">{value.color}</span>
            <input
              type="color"
              value={value.color}
              onChange={(e) => update("color", e.target.value)}
              disabled={isDisabled}
              className={`w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-700/50 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
        <div className="flex gap-1">
          {quickColors.map((color) => (
            <button
              key={color}
              onClick={() => update("color", color)}
              disabled={isDisabled}
              className={`
                flex-1 h-5 rounded transition-all
                ${value.color === color
                  ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-gray-900 scale-110'
                  : 'hover:scale-110 border border-gray-700'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* LINHA 3: ALINHAMENTO + POSIÇÃO VERTICAL */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Alinhamento</label>
          <div className={`flex rounded-lg bg-gray-800/50 border border-gray-700/50 p-0.5 ${isDisabled ? 'opacity-50' : ''}`}>
            {(["left", "center", "right", "justify"] as TextAlign[]).map((align) => {
              const Icon = alignIcons[align];
              const isActive = value.align === align;
              return (
                <button
                  key={align}
                  onClick={() => update("align", align)}
                  disabled={isDisabled}
                  className={`
                    flex-1 flex items-center justify-center py-1.5 rounded-md transition-all
                    ${isActive
                      ? 'bg-purple-600/40 text-purple-300'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }
                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : align === 'right' ? 'Direita' : 'Justificado'}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Posição</label>
          <div className={`flex rounded-lg bg-gray-800/50 border border-gray-700/50 p-0.5 ${isDisabled ? 'opacity-50' : ''}`}>
            {([
              { value: "top", icon: ArrowUp, label: "Cima" },
              { value: "center", icon: CircleDot, label: "Centro" },
              { value: "bottom", icon: ArrowDown, label: "Baixo" },
            ] as { value: TextVerticalPosition; icon: any; label: string }[]).map((pos) => {
              const Icon = pos.icon;
              const isActive = value.verticalPosition === pos.value;
              return (
                <button
                  key={pos.value}
                  onClick={() => update("verticalPosition", pos.value)}
                  disabled={isDisabled}
                  className={`
                    flex-1 flex items-center justify-center py-1.5 rounded-md transition-all
                    ${isActive
                      ? 'bg-purple-600/40 text-purple-300'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }
                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={pos.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* BOTÃO: OPÇÕES AVANÇADAS */}
      {/* ============================================ */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        disabled={isDisabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50
          text-xs text-gray-400 hover:text-white transition-all
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          Opções Avançadas
        </span>
        {showAdvanced ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ============================================ */}
      {/* CONTEÚDO AVANÇADO */}
      {/* ============================================ */}
      {showAdvanced && (
        <div className="space-y-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">

          {/* Contorno */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Contorno</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={value.borderWidth}
                  onChange={(e) => update("borderWidth", Number(e.target.value))}
                  disabled={isDisabled}
                  className="w-12 px-2 py-0.5 rounded bg-gray-800/50 border border-gray-700/50 text-white text-[10px] text-center focus:border-purple-500/50 focus:outline-none"
                />
                <input
                  type="color"
                  value={value.borderColor}
                  onChange={(e) => update("borderColor", e.target.value)}
                  disabled={isDisabled}
                  className={`w-6 h-6 rounded bg-gray-800/50 border border-gray-700/50 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={value.borderWidth}
              onChange={(e) => update("borderWidth", Number(e.target.value))}
              disabled={isDisabled}
              className={`w-full accent-purple-400 ${isDisabled ? 'opacity-50' : ''}`}
            />
          </div>

          {/* Fundo do texto */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Fundo do texto</label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">{value.backgroundOpacity}%</span>
                <input
                  type="color"
                  value={value.backgroundColor}
                  onChange={(e) => update("backgroundColor", e.target.value)}
                  disabled={isDisabled}
                  className={`w-6 h-6 rounded bg-gray-800/50 border border-gray-700/50 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={value.backgroundOpacity}
              onChange={(e) => update("backgroundOpacity", Number(e.target.value))}
              disabled={isDisabled}
              className={`w-full accent-purple-400 ${isDisabled ? 'opacity-50' : ''}`}
            />
          </div>

          {/* Sombra */}
          {showShadow && (
            <div className="space-y-2 border-t border-gray-700/30 pt-2">
              <button
                onClick={() => {
                  if (!isDisabled) {
                    update("shadow", !value.shadow);
                    setShowShadowOptions(!value.shadow);
                  }
                }}
                disabled={isDisabled}
                className={`
                  w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all
                  ${value.shadow
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sombra
                </span>
                <span className="text-[10px]">
                  {value.shadow ? 'Ativada' : 'Desativada'}
                </span>
              </button>

              {value.shadow && (
                <div className="space-y-2 pl-2 border-l-2 border-purple-500/30">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500">Desfoque</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={value.shadowBlur}
                        onChange={(e) => update("shadowBlur", Number(e.target.value))}
                        disabled={isDisabled}
                        className="w-full px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-white text-[10px] focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500">Cor</label>
                      <input
                        type="color"
                        value={value.shadowColor}
                        onChange={(e) => update("shadowColor", e.target.value)}
                        disabled={isDisabled}
                        className="w-full h-7 rounded bg-gray-800/50 border border-gray-700/50 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500">Deslocamento X</label>
                      <input
                        type="number"
                        min={-30}
                        max={30}
                        value={value.shadowX}
                        onChange={(e) => update("shadowX", Number(e.target.value))}
                        disabled={isDisabled}
                        className="w-full px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-white text-[10px] focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500">Deslocamento Y</label>
                      <input
                        type="number"
                        min={-30}
                        max={30}
                        value={value.shadowY}
                        onChange={(e) => update("shadowY", Number(e.target.value))}
                        disabled={isDisabled}
                        className="w-full px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-white text-[10px] focus:border-purple-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão Reset */}
          <button
            onClick={resetDefaults}
            disabled={isDisabled}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg
              bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50
              text-[10px] text-gray-400 hover:text-white transition-all
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <RotateCcw className="w-3 h-3" />
            Resetar efeitos
          </button>
        </div>
      )}
    </div>
  );
}