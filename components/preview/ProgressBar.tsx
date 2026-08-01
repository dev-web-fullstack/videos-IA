"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface ProgressBarProps {
  duration?: number;
  hasAnimation?: boolean; // NOVO: indicar se tem animação
}

export interface ProgressBarRef {
  finish: () => void;
}

const ProgressBar = forwardRef<ProgressBarRef, ProgressBarProps>(
  ({ duration = 5, hasAnimation = false }, ref) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Gerando vídeo...");

    useImperativeHandle(ref, () => ({
      finish: () => {
        setProgress(100);
        setStatus("✅ Vídeo gerado com sucesso!");
      },
    }));

    useEffect(() => {
      setProgress(0);
      setStatus("Iniciando...");

      // Tempo estimado baseado na duração e se tem animação
      let estimatedTotalTime = duration * 1.5;
      if (hasAnimation) {
        estimatedTotalTime = duration * 3.5; // Animações demoram mais
      }

      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newProgress = Math.min((elapsed / estimatedTotalTime) * 100, 99);

        setProgress(newProgress);

        // Atualizar status
        if (newProgress < 20) {
          setStatus("🎬 Inicializando...");
        } else if (newProgress < 40) {
          setStatus("🔄 Processando vídeo...");
        } else if (newProgress < 60) {
          setStatus("🎨 Aplicando estilos...");
        } else if (newProgress < 75) {
          setStatus("✨ Renderizando...");
        } else if (newProgress < 90) {
          if (hasAnimation) {
            setStatus("🎨 Renderizando animações... (pode demorar um pouco)");
          } else {
            setStatus("📦 Finalizando...");
          }
        } else {
          if (hasAnimation) {
            setStatus("⏳ Quase pronto! Renderizando efeitos finais...");
          } else {
            setStatus("⏳ Quase pronto...");
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }, [duration, hasAnimation]);

    return (
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-300">{status}</p>
          <span className="text-sm font-mono text-green-400">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out relative"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, 
                #22c55e 0%, 
                #4ade80 30%, 
                #22c55e 60%, 
                #15803d 100%
              )`,
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateX(-100%)',
                animation: progress < 100 ? 'shimmer 2s infinite' : 'none',
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>🔹 {Math.round(progress)}% completo</span>
          <span>
            {progress < 100 ? (
              <span className="animate-pulse">⏳ Processando...</span>
            ) : (
              <span className="text-green-400">✅ Completo!</span>
            )}
          </span>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;