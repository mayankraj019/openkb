import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDocumentProxy, extractText } from 'unpdf';
import { getPineconeClient } from '@/lib/pinecone';
import { getEmbeddings } from '@/lib/embeddings';
import { chunkText } from '@/lib/chunking';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Accept all PDFs regardless of MIME type reported by OS
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Convert file to Uint8Array - the only format unpdf/pdfjs accepts
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Parse PDF using unpdf
    let fullText = '';
    try {
      const pdf = await getDocumentProxy(uint8Array);
      const { text: pageTexts } = await extractText(pdf, { mergePages: false });

      for (const pageText of pageTexts) {
        fullText += pageText + '\n';
      }
    } catch (parseErr) {
      console.error('PDF parse error:', parseErr);
      return NextResponse.json(
        { error: 'Could not read this PDF. It may be scanned or password-protected.' },
        { status: 422 }
      );
    }

    // Fallback: if no text found, still save the document record
    const textToIndex = fullText.trim();

    // Chunk text (only if we have text to index)
    const docId = uuidv4();

    // Init Pinecone
    const pinecone = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX || 'openkb';
    const index = pinecone.Index(indexName);

    if (textToIndex.length > 0) {
      const chunks = chunkText(textToIndex, 1000, 200);

      // Generate Embeddings and Upsert in batches
      const vectors: Array<{
        id: string;
        values: number[];
        metadata: { docId: string; fileName: string; text: string; chunkIndex: number };
      }> = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await getEmbeddings(chunk);
        vectors.push({
          id: `${docId}-chunk-${i}`,
          values: embedding,
          metadata: {
            docId,
            fileName: file.name,
            text: chunk,
            chunkIndex: i,
          },
        });
      }

      // Pinecone upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        // Pinecone v7 serverless: use { records: [...] } format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (index.upsert as any)({ records: batch });
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        name: file.name,
        size: file.size,
        createdAt: Date.now(),
        hasText: textToIndex.length > 0,
      },
    });
  } catch (error: unknown) {
    console.error('Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
