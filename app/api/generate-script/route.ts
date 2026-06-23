// Importa o helper do Next.js para responder em JSON
import { NextResponse } from "next/server";

// Função que responde requisições POST nesta rota
export async function POST(req: Request) {

  // Lê o corpo da requisição e converte de JSON para objeto JavaScript
  // Exemplo: { "topic": "Davi e Golias" }
  const body = await req.json();

  // Retorna uma resposta em formato JSON para o cliente
  return NextResponse.json({

    // Mensagem fixa apenas para teste da API
    message: "API funcionando!",

    // Aqui devolvemos exatamente o que foi enviado na requisição
    // Isso serve para confirmar que os dados chegaram corretamente
    received: body,
  });
}