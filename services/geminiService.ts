import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Transaction, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Chat com o Consultor Financeiro
 */
export const sendFinancialChatMessage = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[],
  transactions: Transaction[]
): Promise<string> => {
  try {
    // Summarize financial context for the model
    const financialSummary = JSON.stringify(transactions.map(t => ({
      desc: t.description,
      amt: t.amount,
      type: t.type,
      cat: t.category,
      date: new Date(t.date).toLocaleDateString()
    })));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: `Você é um Consultor Financeiro Especialista. 
        O usuário fornecerá perguntas sobre finanças.
        Você tem acesso aos dados financeiros atuais do usuário neste JSON: ${financialSummary}.
        
        Diretrizes:
        1. Responda de forma concisa e prática.
        2. Use Markdown para formatar tabelas ou listas se necessário.
        3. Se o usuário perguntar sobre gastos, calcule com base nos dados fornecidos.
        4. Dê conselhos amigáveis e focados em economia e investimento.
        5. Fale português do Brasil.`,
      }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Não consegui processar sua pergunta financeira no momento.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Falha ao consultar o Gemini.");
  }
};

/**
 * General Chat Message
 */
export const sendChatMessage = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are a helpful AI assistant."
      }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

/**
 * Generate Image from Text
 */
export const generateImageFromText = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64String}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * Analyze Image with Prompt
 */
export const analyzeImageWithPrompt = async (imageUrl: string, prompt: string): Promise<string> => {
  try {
    // Extract mimeType and base64 data
    const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid image format");
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

/**
 * Categoriza automaticamente uma transação baseada na descrição
 */
export const autoCategorizeTransaction = async (description: string, amount: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize a transação financeira descrita como: "${description}" (Valor: ${amount}).
      Retorne APENAS uma das seguintes categorias (exatamente como escrito): 
      Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Salário, Investimentos, Outros.
      Se não tiver certeza, retorne Outros.`,
    });

    const category = response.text?.trim();
    // Validate functionality
    const validCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Investimentos', 'Outros'];
    if (category && validCategories.includes(category)) {
      return category;
    }
    return 'Outros';
  } catch (error) {
    console.error("Auto Categorize Error:", error);
    return 'Outros';
  }
};

/**
 * Analisa a saúde financeira geral e dá dicas
 */
export const getFinancialHealthCheck = async (transactions: Transaction[]): Promise<string> => {
   try {
    const dataStr = JSON.stringify(transactions);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise estes dados financeiros (JSON): ${dataStr}. 
      Forneça um resumo curto de 3 pontos com:
      1. Um elogio sobre o comportamento financeiro.
      2. Um ponto de atenção/alerta.
      3. Uma dica prática para o próximo mês.
      Use emojis e formatação Markdown.`,
    });
    return response.text || "Não foi possível gerar análise.";
   } catch (error) {
     return "Erro ao analisar dados.";
   }
};

/**
 * Processa linguagem natural (texto ou áudio transcrito) para extrair transações
 */
export const parseTransactionsFromNaturalLanguage = async (input: string, audioBase64?: string): Promise<any[]> => {
  try {
    const parts: any[] = [];
    
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: "audio/wav",
          data: audioBase64
        }
      });
      parts.push({ text: "Analise o áudio e extraia as transações financeiras." });
    } else {
      parts.push({ text: `Analise este texto e extraia transações financeiras: "${input}"` });
    }

    parts.push({ text: `
      Identifique se é RECEITA (INCOME) ou DESPESA (EXPENSE).
      Identifique se é FIXO (FIXED) (ex: aluguel, netflix, salário) ou ESPORÁDICO (SPORADIC) (ex: uber, jantar).
      Categorize entre: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Salário, Investimentos, Outros.
      
      Retorne APENAS um JSON array válido. Exemplo:
      [
        { "description": "McDonalds", "amount": 50.00, "type": "EXPENSE", "category": "Alimentação", "expenseType": "SPORADIC" }
      ]
      Se não encontrar nada, retorne [].
    `});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    // Clean markdown code blocks if present
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("NLP Transaction Error:", error);
    throw new Error("Falha ao interpretar o texto/áudio.");
  }
};