import { GoogleGenAI, Type } from "@google/genai";
import type { DiagnosisResponse } from "../types";

// Check if API key is available
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
  throw new Error("VITE_API_KEY environment variable is required for Google Gemini service. Please set it in your .env file.");
}

const ai = new GoogleGenAI({ apiKey });


const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    possiveisCausas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Uma lista de causas potenciais para o problema.'
    },
    verificacoesRecomendadas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Uma lista de passos que um mecânico deve seguir para confirmar o diagnóstico.'
    },
    servicosSugeridos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING, description: 'O nome do serviço ou peça sugerido.' },
          tipo: { type: Type.STRING, description: "O tipo, que pode ser 'peça' ou 'serviço'." }
        },
        required: ['nome', 'tipo']
      },
      description: 'Uma lista de serviços e peças relevantes para resolver o problema.'
    }
  },
  required: ['possiveisCausas', 'verificacoesRecomendadas', 'servicosSugeridos']
};


export const getAIDiagnosis = async (
  problemDescription: string,
  services: { name: string }[],
  parts: { name: string }[]
): Promise<DiagnosisResponse> => {
  // The GoogleGenAI constructor handles the API key presence.
  // The old check was related to the now-removed setup page.
  
  const model = "gemini-2.5-flash";

  const availableServices = services.map(s => s.name).join(", ") || "Nenhum serviço cadastrado";
  const availableParts = parts.map(p => p.name).join(", ") || "Nenhuma peça cadastrada";

  const prompt = `
    Você é um assistente especialista em mecânica de automóveis para um sistema de gestão de oficinas.
    Dada a descrição de um problema de um veículo, sua tarefa é fornecer um diagnóstico.
    Sua resposta DEVE ser um objeto JSON bem-formado que siga o esquema fornecido.

    Lista de serviços disponíveis na oficina:
    ${availableServices}

    Lista de peças e óleos disponíveis na oficina:
    ${availableParts}

    Descrição do problema pelo cliente:
    "${problemDescription}"
  `;

  try {
    const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: diagnosisSchema,
            temperature: 0.5,
        }
    });

    // FIX: Add nullish coalescing operator to prevent calling trim() on undefined.
    const jsonStr = (result.text ?? '').trim();
    if (!jsonStr) {
        throw new Error("A API Gemini retornou uma resposta vazia ou malformada.");
    }
    // With responseSchema, we trust the API to return a valid structure.
    // The JSON.parse is still needed because response.text is a string.
    return JSON.parse(jsonStr) as DiagnosisResponse;

  } catch (error: any) {
    console.error("Erro ao chamar a API Gemini:", error);
    throw new Error("Não foi possível obter um diagnóstico da IA. Verifique a sua conexão à internet, a chave de API e a consola para mais detalhes.");
  }
};
