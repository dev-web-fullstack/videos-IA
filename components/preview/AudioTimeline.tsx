// components/preview/AudioTimeline.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

interface AudioTimelineProps {
  audioPath?: string;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onTimeChange: (time: number) => void;
  onDurationChange: (duration: number) => void;
  currentTime: number;
  videoDuration: number;
  hasAudio: boolean;
}

export default function AudioTimeline({
  audioPath,
  isPlaying,
  onPlayToggle,
  onTimeChange,
  onDurationChange,
  currentTime,
  videoDuration,
  hasAudio,
}: AudioTimelineProps) {

  const [audioDuration, setAudioDuration] = useState(videoDuration);
  const [localTime, setLocalTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const audioLoadedRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);
  const isCreatingRef = useRef(false);

  // ============================================
  // CARREGAR ÁUDIO
  // ============================================

  useEffect(() => {
    // Se não há áudio, limpar
    if (!hasAudio || !audioPath) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsLoaded(false);
      setIsLoading(false);
      setError(null);
      audioLoadedRef.current = false;
      previousPathRef.current = null;
      return;
    }

    // Se já carregou este áudio e está carregado, não fazer nada
    if (previousPathRef.current === audioPath && audioLoadedRef.current) {
      console.log('✅ Áudio já carregado e pronto:', audioPath);
      return;
    }

    // Se já carregou este áudio mas não está carregado, tentar novamente
    if (previousPathRef.current === audioPath && !audioLoadedRef.current) {
      console.log('🔄 Tentando recarregar áudio:', audioPath);
    }

    // Evitar criação duplicada
    if (isCreatingRef.current) {
      console.log('⏳ Já criando áudio...');
      return;
    }

    console.log('🔊 Carregando áudio para timeline:', audioPath);
    isCreatingRef.current = true;
    previousPathRef.current = audioPath;
    setIsLoading(true);
    setIsLoaded(false);
    audioLoadedRef.current = false;
    setError(null);

    // Limpar áudio anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Criar novo áudio
    const audio = new Audio();
    const audioUrl = audioPath.startsWith('/') ? audioPath : `/${audioPath}`;
    audio.src = audioUrl;
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Eventos
    audio.onloadedmetadata = () => {
      if (!isMounted.current) return;
      const duration = audio.duration || 0;
      console.log('✅ Áudio carregado, duração:', duration);
      audioLoadedRef.current = true;
      isCreatingRef.current = false;
      setIsLoaded(true);
      setIsLoading(false);
      setAudioDuration(duration);
      onDurationChange(Math.ceil(duration));
      setError(null);
    };

    audio.oncanplay = () => {
      if (!isMounted.current) return;
      console.log('✅ Áudio pronto para reproduzir');
      const duration = audio.duration || 0;
      if (duration > 0) {
        audioLoadedRef.current = true;
        isCreatingRef.current = false;
        setIsLoaded(true);
        setIsLoading(false);
        setAudioDuration(duration);
        onDurationChange(Math.ceil(duration));
        setError(null);
      }
    };

    audio.onerror = (e) => {
      if (!isMounted.current) return;
      console.error('❌ Erro no áudio:', e);
      console.error('❌ audio.src:', audio.src);
      isCreatingRef.current = false;
      setError('Erro ao carregar áudio');
      setIsLoaded(false);
      setIsLoading(false);
      audioLoadedRef.current = false;
    };

    audio.onended = () => {
      if (!isMounted.current) return;
      console.log('⏹️ Áudio terminou');
      setLocalTime(0);
      onTimeChange(0);
      onPlayToggle();
    };

    audio.ontimeupdate = () => {
      if (!isMounted.current) return;
      const time = audio.currentTime || 0;
      setLocalTime(time);
      if (Math.abs(time - currentTime) > 0.3) {
        onTimeChange(time);
      }
    };

    try {
      audio.load();
    } catch (err) {
      console.error('❌ Erro ao carregar áudio:', err);
      isCreatingRef.current = false;
      setError('Erro ao carregar áudio');
      setIsLoaded(false);
      setIsLoading(false);
      audioLoadedRef.current = false;
    }

    // Timeout de segurança
    setTimeout(() => {
      if (isCreatingRef.current) {
        console.log('⏰ Timeout: forçando fim de carregamento');
        isCreatingRef.current = false;
        setIsLoading(false);
        if (!audioLoadedRef.current) {
          setError('Timeout ao carregar áudio');
        }
      }
    }, 10000);

    return () => {
      isCreatingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [audioPath, isMuted, volume, hasAudio, videoDuration, onDurationChange, onTimeChange, onPlayToggle]);

  // ============================================
  // PLAY/PAUSE
  // ============================================

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded || !hasAudio) return;

    if (isPlaying) {
      if (audio.currentTime >= audioDuration && audioDuration > 0) {
        audio.currentTime = 0;
        setLocalTime(0);
        onTimeChange(0);
      }
      audio.play().catch((err) => {
        console.error('❌ Erro ao reproduzir:', err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isLoaded, audioDuration, hasAudio, onTimeChange]);

  // ============================================
  // SINCronizar TEMPO EXTERNO
  // ============================================

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded || !hasAudio) return;
    const timeDiff = Math.abs(audio.currentTime - currentTime);
    if (timeDiff > 0.5) {
      audio.currentTime = currentTime;
      setLocalTime(currentTime);
    }
  }, [currentTime, isLoaded, hasAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !isLoaded || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = x * audioDuration;
    if (!isNaN(newTime) && isFinite(newTime) && newTime >= 0 && newTime <= audioDuration) {
      audio.currentTime = newTime;
      setLocalTime(newTime);
      onTimeChange(newTime);
    }
  }, [audioDuration, isLoaded, hasAudio, onTimeChange]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayDuration = isLoaded && audioDuration > 0 ? audioDuration : videoDuration;
  const displayTime = isLoaded ? localTime : currentTime;
  const isDisabled = !hasAudio || !isLoaded || !!error;

  return (
    <div className="w-full max-w-[90%] min-w-[280px]">
      {/* Barra de progresso */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPlayToggle}
          disabled={isDisabled}
          className={`flex-shrink-0 p-1.5 rounded-full transition-all ${isDisabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:text-purple-400 hover:bg-white/10'
            }`}
          title={isDisabled ? (isLoading ? "Carregando..." : "Nenhum áudio") : isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <span className="text-xs font-mono text-white/80 min-w-[40px]">
          {formatTime(displayTime)}
        </span>

        <div
          className={`flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden ${!isDisabled ? 'cursor-pointer' : 'cursor-default'
            } relative group`}
          onClick={!isDisabled ? handleProgressClick : undefined}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
            style={{
              width: displayDuration > 0 ? `${(displayTime / displayDuration) * 100}%` : '0%'
            }}
          />
          {!isDisabled && (
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-full" />
          )}
        </div>

        <span className="text-xs font-mono text-white/60 min-w-[40px]">
          {formatTime(displayDuration)}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            disabled={isDisabled}
            className={`p-1 rounded-full ${isDisabled
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
            onChange={handleVolumeChange}
            disabled={isDisabled}
            className={`w-12 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-400 ${isDisabled ? 'opacity-50' : ''
              }`}
            style={{
              background: !isDisabled
                ? `linear-gradient(to right, #a855f7 0%, #a855f7 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                : '#374151'
            }}
          />
        </div>
      </div>

      {/* Status */}
      {isLoading && (
        <div className="text-center text-[10px] text-yellow-400 mt-1 animate-pulse">
          Carregando áudio...
        </div>
      )}
      {error && (
        <div className="text-center text-[10px] text-red-400 mt-1">
          {error}
        </div>
      )}
      {!hasAudio && !isLoading && (
        <div className="text-center text-[10px] text-gray-500 mt-1">
          Selecione um áudio para reproduzir
        </div>
      )}
      {hasAudio && isLoaded && !isLoading && !error && (
        <div className="text-center text-[10px] text-gray-500 mt-1">
          {audioPath?.split('/').pop() || 'Áudio carregado'}
        </div>
      )}
    </div>
  );
}