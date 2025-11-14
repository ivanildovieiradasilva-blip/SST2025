import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the type for the DDS Content
export interface DDSContent {
  titulo: string;
  introducao: string;
  caso_real: string;
  pontos_chave: string[];
  como_prevenir: string[];
  perguntas_reflexao: string[];
  mensagem_final: string;
  nr_relacionada: string;
}

// Function to generate the image
const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    const fullPrompt = `${prompt}, no estilo de um filme de animação 3D, iluminação cinematográfica, cores vibrantes, como um filme da Pixar, arte digital`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
        return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
    } else {
        throw new Error("Nenhuma imagem foi gerada.");
    }
};

// Function to generate the DDS content
const generateDDSFromPrompt = async (prompt: string): Promise<DDSContent> => {
    const ddsSchema = {
        type: Type.OBJECT,
        properties: {
            titulo: { type: Type.STRING, description: 'Título chamativo para um Diálogo Diário de Segurança (DDS) com no máximo 60 caracteres.' },
            introducao: { type: Type.STRING, description: 'Parágrafo inicial de 2-3 frases contextualizando o tema.' },
            caso_real: { type: Type.STRING, description: 'Descrição de um caso real ou situação prática e realista no Brasil sobre o tema (4-5 frases). Não use a expressão "Lembro de um caso...".' },
            pontos_chave: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista com 4 pontos chave importantes sobre o tema.'
            },
            como_prevenir: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista com 3 ações práticas e diretas para prevenir o risco.'
            },
            perguntas_reflexao: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista com 3 perguntas que engajam a equipe e promovem discussão.'
            },
            mensagem_final: { type: Type.STRING, description: 'Uma frase final motivacional ou um chamado à ação impactante.' },
            nr_relacionada: { type: Type.STRING, description: 'A Norma Regulamentadora (NR) aplicável ao tema (ex: NR-35) ou "Geral" se não houver uma específica.' }
        },
        required: ['titulo', 'introducao', 'caso_real', 'pontos_chave', 'como_prevenir', 'perguntas_reflexao', 'mensagem_final', 'nr_relacionada']
    };

    const systemInstruction = `Você é um especialista em Segurança do Trabalho no Brasil. Sua tarefa é criar o conteúdo para um Diálogo Diário de Segurança (DDS) a partir de um tema. O conteúdo deve ser prático, objetivo e usar linguagem simples. Siga estritamente a estrutura JSON fornecida, preenchendo todos os campos. O caso real deve ser crível e ambientado no Brasil. As perguntas devem incentivar a participação. Retorne SOMENTE o objeto JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: ddsSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("A resposta da API de texto estava vazia.");
    }
    return JSON.parse(jsonText);
};

// Main function to generate both image and DDS content
export const generateContent = async (prompt: string): Promise<{ imageUrl: string, ddsContent: DDSContent }> => {
    try {
        // Step 1: Generate the DDS content first to get the specific title.
        const ddsContent = await generateDDSFromPrompt(prompt);
        
        // Step 2: Use the generated title to create a highly relevant image.
        const imageUrl = await generateImageFromPrompt(ddsContent.titulo);

        return { imageUrl, ddsContent };
    } catch (error) {
        console.error("Erro ao gerar conteúdo:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Falha na API do Gemini: ${error.message}`));
        }
        return Promise.reject(new Error("Ocorreu um erro desconhecido ao gerar o conteúdo."));
    }
};