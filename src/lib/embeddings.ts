import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
  }
  return genAI;
}

// gemini-embedding-001 with 768 output dimensions (Pinecone free-tier compatible)
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent({
      content: { parts: [{ text: text.replace(/\n/g, ' ') }], role: 'user' },
      outputDimensionality: 768,
    } as any);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}
