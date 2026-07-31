"use client";

import VideoPlayer from "./VideoPlayer";
import { useState, useEffect } from "react";

type Props = {
  result: any;
  onDownload?: () => void;
  isDownloading?: boolean;
  onDelete?: () => void;
};

export default function ResultCard({
  result,
  onDownload,
  isDownloading = false,
  onDelete,
}: Props) {

  const [deleted, setDeleted] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // RESETAR OS ESTADOS QUANDO UM NOVO VÍDEO É GERADO
  useEffect(() => {
    if (result) {
      setDeleted(false);
      setDownloadComplete(false);
    }
  }, [result]);

  if (!result) return null;

  // Função para lidar com o download e exclusão
  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();

      // Após o download, notificar que o vídeo foi deletado
      setDownloadComplete(true);

      // Aguardar um pouco antes de remover da tela
      setTimeout(() => {
        setDeleted(true);
        if (onDelete) {
          onDelete();
        }
      }, 2000);
    }
  };

  // Se o vídeo foi deletado, não mostrar mais
  if (deleted) {
    return (
      <div className="flex items-center justify-center p-6 rounded-xl bg-green-900/30 border border-green-700">
        <div className="text-center text-green-400">
          <span className="text-lg font-semibold">✅ Vídeo baixado com sucesso!</span>
          <br />
          <span className="text-sm text-gray-400">
            O vídeo foi removido do servidor para economizar espaço.
            <br />
            Gere um novo vídeo para continuar.
          </span>
        </div>
      </div>
    );
  }

  // Mensagem de download completo (antes de deletar)
  if (downloadComplete) {
    return (
      <div className="flex items-center justify-center p-6 rounded-xl bg-yellow-900/30 border border-yellow-700">
        <div className="text-center text-yellow-400">
          <span className="text-lg font-semibold">📥 Download concluído!</span>
          <br />
          <span className="text-sm text-gray-400">
            Removendo vídeo do servidor...
          </span>
        </div>
      </div>
    );
  }

  return (

    <section className="space-y-6">

      {result.success && result.videoPath && (
        <>
          {/* Player do vídeo */}
          <div className="flex justify-center">
            <VideoPlayer videoPath={result.videoPath} />
          </div>

          {/* Botão de download */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`
              w-full rounded-lg transition p-3 font-bold text-white
              ${isDownloading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500"
              }
            `}
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Baixando...
              </span>
            ) : (
              "📥 Baixar Vídeo"
            )}
          </button>

          {/* Texto informativo */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 text-center">
              ⚠️ O vídeo será removido do servidor automaticamente após o download
            </p>
            <p className="text-xs text-gray-500 text-center mt-1">
              Arquivos temporários também serão limpos
            </p>
          </div>

          <details className="bg-gray-900 rounded-lg p-4">
            <summary className="cursor-pointer text-sm text-green-400 font-semibold">
              Informações da geração
            </summary>
            <pre className="mt-4 text-xs overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </>
      )}

      {!result.success && result.error && (
        <div className="flex items-center justify-center p-6 rounded-xl bg-red-900/30 border border-red-700">
          <span className="text-red-400">
            ❌ {result.error}
          </span>
        </div>
      )}

    </section>

  );

}