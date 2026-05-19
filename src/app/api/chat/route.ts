import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPineconeClient } from '@/lib/pinecone';
import { getEmbeddings } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { messages, docIds } = await req.json();

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    let contextText = '';

    if (docIds && docIds.length > 0) {
      const questionEmbedding = await getEmbeddings(lastMessage.content);

      const pinecone = getPineconeClient();
      const indexName = process.env.PINECONE_INDEX || 'openkb';
      const index = pinecone.Index(indexName);

      // Query without filter to get all top results, then filter by docId in app
      const queryResponse = await index.query({
        vector: questionEmbedding,
        topK: 20,           // fetch more to ensure we cover all docs
        includeMetadata: true,
      });

      // Filter matches by docIds in application code (more reliable than Pinecone metadata filter)
      const docIdSet = new Set(docIds);
      const relevantMatches = queryResponse.matches.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m: any) => m.metadata?.docId && docIdSet.has(m.metadata.docId)
      );

      if (relevantMatches.length > 0) {
        contextText = relevantMatches
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m: any) => `[Document: ${m.metadata?.fileName ?? 'unknown'}]\n${m.metadata?.text ?? ''}`)
          .join('\n\n---\n\n');
      }
    }

    const systemPrompt = contextText
      ? `You are an AI document assistant for OpenKB.
Answer the user's question using ONLY the document context provided below.
If the answer is not in the context, say exactly: "I could not find this information in the uploaded documents."

Document Context:
"""
${contextText}
"""`
      : `You are an AI document assistant for OpenKB. No document context is available. Ask the user to upload documents from the Dashboard and try again.`;

    // Build Gemini chat history (exclude the last user message — sent separately via sendMessageStream)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    // Stream back in Vercel AI SDK data stream format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error: unknown) {
    console.error('Chat Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during chat';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
