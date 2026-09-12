# 🎬 Videos IA

Gerador de vídeos personalizados com texto, imagens, áudio e fundo gerado por IA.

> Desenvolvido com o auxílio do **[DeepSeek](https://deepseek.com)**.

---

## ✨ O que faz

- Cria vídeos a partir de texto com estilo personalizável
- Gera voz a partir de texto (Text-to-Speech)
- Cria fundos com IA ou cor sólida
- Adiciona imagens e áudios ao vídeo
- Preview em tempo real e download automático

---

## 🔌 APIs utilizadas

| Ferramenta | Uso | Custo |
|-----------|-----|-------|
| **Fish Audio** | Gerar voz (TTS) | Grátis (requer chave) |
| **Pollinations.ai** | Gerar imagens IA | Grátis (sem chave) |
| **Freesound** | Biblioteca de sons | Grátis (requer chave) |

---

## 🛠️ Tecnologias

- Next.js 16
- TypeScript
- Tailwind CSS
- FFmpeg
- Sharp

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/videos-ia.git
cd videos-ia

# Instale as dependências
npm install

# Instale o FFmpeg (Windows)
winget install ffmpeg

# Instale o FFmpeg (Mac)
brew install ffmpeg

# Instale o FFmpeg (Linux)
sudo apt install ffmpeg

# Baixe as fontes
npm run download-fonts

# Execute o projeto
npm run dev

# Criar arquivo .env.local ma raiz
FISH_AUDIO_API_KEY=sua_chave_aqui
FREESOUND_API_KEY=sua_chave_aqui