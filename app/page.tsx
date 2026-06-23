"use client";
// Diz que essa página roda no navegador (necessário para usar fetch e estados)

import { useState } from "react";

export default function Home() {
  // Guarda o texto digitado pelo usuário
  const [topic, setTopic] = useState("");

  // Guarda a resposta da API
  const [result, setResult] = useState<any>(null);

  // Função que chama a API
  async function handleGenerate() {
    const response = await fetch("/api/generate-script", {
      method: "POST", // tipo da requisição
      headers: {
        "Content-Type": "application/json", // informando que estamos enviando JSON
      },
      body: JSON.stringify({
        topic: topic, // envia o texto digitado
      }),
    });

    const data = await response.json(); // converte resposta para JSON
    setResult(data); // salva na tela
  }

  return (
    <main style={{ padding: 20 }}>

      {/* Campo de texto */}
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Digite um tema"
        style={{ padding: 10, width: 300 }}
      />

      {/* Botão para chamar API */}
      <button
        onClick={handleGenerate}
        style={{ marginLeft: 10, padding: 10 }}
      >
        Gerar
      </button>

      {/* Área de resultado */}
      <pre style={{ marginTop: 20 }}>
        {result && JSON.stringify(result, null, 2)}
      </pre>

    </main>
  );
}