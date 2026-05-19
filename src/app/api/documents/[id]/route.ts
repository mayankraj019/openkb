import { NextRequest, NextResponse } from 'next/server';
import { getPineconeClient } from '@/lib/pinecone';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pinecone = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX || 'openkb';
    const index = pinecone.Index(indexName);

    // Delete vectors matching this docId using filter
    await index.deleteMany({
      filter: { docId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
