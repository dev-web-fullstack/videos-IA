// components/form/TTSGenerator.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Loader2,
  Trash2,
  Sparkles,
  AlertCircle,
  Volume2,
  Check,
  Music,
  X
} from "lucide-react";
import type { TTSVoiceMap, TTSGenerateResponse } from "@/lib/tts";
import { DEFAULT_VOICES, DEFAULT_VOICE, validateTTSText } from "@/lib/tts";

interface TTSGeneratorProps {
  onAudioGenerated?: (audioPath: string, filename: string, duration?: number) => void;
  onAudioRemove?: (audioPath: string) => void;
  disabled?: boolean;
  selectedAudioPath?: string | null;
}

interface TTSAudioFile {
  name: string;
  path: string;
  size: number;
  duration?: number;
  createdAt: Date;
  text?: string;
}

export default function TTSGenerator({
  onAudioGenerated,
  onAudioRemove,
  disabled = false,
  selectedAudioPath = null,
}: TTSGeneratorProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [voices, setVoices] = useState<TTSVoiceMap>(DEFAULT_VOICES);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsAudios, setTtsAudios] = useState<TTSAudioFile[]>([]);
  const [selectedTtsPath, setSelectedTtsPath] = useState<string | null>(selectedAudioPath);
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
    loadTtsAudios();
  }, []);

  // Atualizar selectedPath quando o pai mudar
  useEffect(() => {
    setSelectedTtsPath(selectedAudioPath);
  }, [selectedAudioPath]);

  // Carregar áudios TTS existentes
  const loadTtsAudios = async () => {
    try {
      const response = await fetch("/api/tts/list");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audios) {
          setTtsAudios(data.audios);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar áudios TTS:", error);
    }
  };

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
        // Recarregar lista de áudios
        await loadTtsAudios();

        // Selecionar automaticamente o áudio gerado
        setSelectedTtsPath(data.audioPath);

        // Notificar o pai
        if (onAudioGenerated && data.audioPath) {
          onAudioGenerated(data.audioPath, data.filename || '', data.duration);
        }

        // Limpar o texto após gerar
        setText("");

        // Mostrar feedback
        setError(null);
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

  const handleSelectAudio = (audioPath: string) => {
    if (disabled) return;

    if (selectedTtsPath === audioPath) {
      // Deselecionar
      setSelectedTtsPath(null);
      if (onAudioRemove) {
        onAudioRemove(audioPath);
      }
    } else {
      // Selecionar
      setSelectedTtsPath(audioPath);
      // Notificar o pai sobre o áudio selecionado
      const audio = ttsAudios.find(a => a.path === audioPath);
      if (audio && onAudioGenerated) {
        onAudioGenerated(audio.path, audio.name, audio.duration);
      }
    }
  };

  const handleDeleteAudio = async (audioPath: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Tem certeza que deseja excluir este áudio?")) return;

    try {
      const response = await fetch("/api/tts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioPath }),
      });

      if (response.ok) {
        await loadTtsAudios();
        if (selectedTtsPath === audioPath) {
          setSelectedTtsPath(null);
          if (onAudioRemove) {
            onAudioRemove(audioPath);
          }
        }
      } else {
        alert("Erro ao excluir áudio");
      }
    } catch (error) {
      console.error("❌ Erro ao excluir:", error);
      alert("Erro ao excluir áudio");
    }
  };

  const charCount = text.length;
  const isTextValid = text.trim().length > 0 && charCount <= 5000;

  // Verificar se o áudio atual está selecionado
  const isSelected = (audioPath: string) => selectedTtsPath === audioPath;

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
          className="w-full h-24 rounded-lg bg-gray-800/50 border border-gray-700/50 p-3 text-white text-sm placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
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

      {/* Lista de Áudios TTS Gerados */}
      {ttsAudios.length > 0 && (
        <div className="space-y-2 border-t border-gray-700/50 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3 h-3" />
              Vozes Geradas ({ttsAudios.length})
            </label>
            <span className="text-[10px] text-gray-500">
              {selectedTtsPath ? "1 selecionado" : "Nenhum selecionado"}
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {ttsAudios.map((audio) => {
              const selected = isSelected(audio.path);
              return (
                <div
                  key={audio.path}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group
                    ${selected
                      ? "border-purple-400 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-500 bg-gray-800/30"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  onClick={() => !disabled && handleSelectAudio(audio.path)}
                >
                  <Music className={`w-4 h-4 flex-shrink-0 ${selected ? "text-purple-400" : "text-gray-400"}`} />
                  <span className="flex-1 text-xs text-gray-300 truncate flex items-center gap-1">
                    {audio.name.length > 30 ? audio.name.substring(0, 30) + '...' : audio.name}
                  </span>
                  {audio.duration && audio.duration > 0 && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {Math.ceil(audio.duration)}s
                    </span>
                  )}
                  {selected && (
                    <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  )}
                  <button
                    onClick={(e) => handleDeleteAudio(audio.path, e)}
                    disabled={disabled}
                    className="p-0.5 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dicas */}
      {!text && !isGenerating && isApiConfigured && ttsAudios.length === 0 && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Digite um texto (até 5000 caracteres) e escolha uma voz para gerar áudio.
            Os áudios gerados aparecerão na lista abaixo.
          </p>
        </div>
      )}

      {/* Mensagem quando já tem áudios mas texto está vazio */}
      {!text && !isGenerating && isApiConfigured && ttsAudios.length > 0 && (
        <div className="text-center text-[10px] text-gray-500">
          Selecione um áudio da lista ou digite um novo texto para gerar outra voz
        </div>
      )}
    </div>
  );
}