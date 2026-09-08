// components/form/TTSGenerator.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Loader2,
  Play,
  Pause,
  Trash2,
  Download,
  Sparkles,
  AlertCircle,
  Volume2
} from "lucide-react";
import type { TTSVoiceMap, TTSGenerateResponse } from "@/lib/tts";
import { DEFAULT_VOICES, DEFAULT_VOICE, validateTTSText } from "@/lib/tts";

interface TTSGeneratorProps {
  onAudioGenerated?: (audioPath: string, filename: string, duration?: number) => void;
  disabled?: boolean;
}

export default function TTSGenerator({
  onAudioGenerated,
  disabled = false
}: TTSGeneratorProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [voices, setVoices] = useState<TTSVoiceMap>(DEFAULT_VOICES);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioResult, setAudioResult] = useState<TTSGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carregar vozes
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch("/api/tts/voices");
        const data = await response.json();

        if (data.success && data.voices) {
          setVoices(data.voices);
        }

        if (data.isFallback) {
          console.warn('⚠️ Usando vozes padrão (fallback)');
        }
      } catch (error) {
        console.error("❌ Erro ao carregar vozes:", error);
        setVoices(DEFAULT_VOICES);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoices();
  }, []);

  // Limpar áudio quando desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const handleGenerate = async () => {
    const validation = validateTTSText(text);
    if (!validation.valid) {
      setError(validation.error || "Texto inválido");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setAudioResult(null);

    try {
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
          rate,
          pitch,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioResult(data);
        if (onAudioGenerated && data.audioPath) {
          onAudioGenerated(data.audioPath, data.filename || '', data.duration);
        }
      } else {
        setError(data.error || "Erro ao gerar áudio");
        if (data.error?.includes('API key') || data.error?.includes('chave')) {
          setIsApiConfigured(false);
        }
      }
    } catch (error) {
      console.error("❌ Erro:", error);
      setError("Erro ao gerar áudio. Verifique a conexão com a API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioResult?.audioPath) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioResult.audioPath;
        audioRef.current.play().catch((err) => {
          console.error('❌ Erro ao reproduzir:', err);
          setError('Erro ao reproduzir áudio');
        });
        setIsPlaying(true);
      } else {
        // Criar novo áudio
        const audio = new Audio(audioResult.audioPath);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setError("Erro ao reproduzir áudio");
        };
        audio.play().catch((err) => {
          console.error('❌ Erro ao reproduzir:', err);
          setError('Erro ao reproduzir áudio');
        });
        setIsPlaying(true);
        audioRef.current = audio;
      }
    }
  };

  const handleDownload = () => {
    if (!audioResult?.audioPath) return;

    const link = document.createElement('a');
    link.href = audioResult.audioPath;
    link.download = `tts_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setAudioResult(null);
    setError(null);
  };

  const charCount = text.length;
  const isTextValid = text.trim().length > 0 && charCount <= 5000;

  return (
    <div className="space-y-4">
      {/* Área de texto */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" />
            Texto para Voz
          </label>
          <span className={`text-xs ${charCount > 5000 ? 'text-red-400' : 'text-gray-400'}`}>
            {charCount}/5000
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o texto que você quer transformar em voz..."
          disabled={disabled || isGenerating}
          className="w-full h-32 rounded-lg bg-gray-800/50 border border-gray-700/50 p-3 text-white text-sm placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
        />
      </div>

      {/* Controles de voz */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            Voz
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={disabled || isGenerating || isLoading}
            className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white text-sm focus:border-purple-500/50 focus:outline-none"
          >
            {Object.entries(voices).map(([key, voiceData]) => (
              <option key={key} value={key}>
                {voiceData.name} {voiceData.gender === 'female' ? '👩' : voiceData.gender === 'male' ? '👨' : ''}
                {voiceData.language ? ` (${voiceData.language})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium">
            ⚡ Velocidade ({rate}%)
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            disabled={disabled || isGenerating}
            className="w-full accent-purple-400"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Lento</span>
            <span>Normal</span>
            <span>Rápido</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium">
            🎵 Tom ({pitch}Hz)
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            disabled={disabled || isGenerating}
            className="w-full accent-purple-400"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Grave</span>
            <span>Normal</span>
            <span>Agudo</span>
          </div>
        </div>
      </div>

      {/* Aviso de API não configurada */}
      {!isApiConfigured && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-300">
            <p className="font-medium">API Fish Audio não configurada</p>
            <p className="text-yellow-400/70">
              Adicione <code className="bg-yellow-500/20 px-1 rounded">FISH_AUDIO_API_KEY</code> ao seu .env.local
            </p>
          </div>
        </div>
      )}

      {/* Botão Gerar */}
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating || !isTextValid || !isApiConfigured}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
          font-medium text-sm transition-all duration-200
          ${disabled || isGenerating || !isTextValid || !isApiConfigured
            ? "bg-gray-700/50 cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-white"
          }
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gerando voz...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>🎤 Gerar Voz</span>
          </>
        )}
      </button>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 text-sm">❌</span>
          <span className="text-red-300 text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Resultado */}
      {audioResult && (
        <div className="space-y-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-purple-400 flex-shrink-0">🔊</span>
              <span className="text-sm text-gray-300 truncate">
                {audioResult.text || 'Áudio gerado'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handlePlayPause}
                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                title={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-purple-400" />
                ) : (
                  <Play className="w-4 h-4 text-purple-400" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                title="Baixar"
              >
                <Download className="w-4 h-4 text-green-400" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                title="Limpar"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {audioResult.duration && audioResult.duration > 0 && (
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span>⏱️ Duração: {audioResult.duration}s</span>
              <span>📦 Tamanho: {(audioResult.size || 0) / 1024}KB</span>
            </div>
          )}
        </div>
      )}

      {/* Dicas */}
      {!text && !isGenerating && isApiConfigured && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Digite um texto (até 5000 caracteres) e escolha uma voz para gerar áudio.
            Ajuste a velocidade e o tom conforme preferir.
          </p>
        </div>
      )}
    </div>
  );
}