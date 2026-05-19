export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  if (!text) return [];
  
  // Basic text cleanup
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  const chunks: string[] = [];
  let i = 0;
  
  while (i < cleanText.length) {
    chunks.push(cleanText.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  
  return chunks;
}
