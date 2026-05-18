export function chunkText(text, maxTokens = 500) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks = [];
  let chunk = "";

  for (const sentence of sentences) {
    if ((chunk + sentence).length > maxTokens) {
      chunks.push(chunk.trim());
      chunk = sentence;
    } else {
      chunk += sentence;
    }
  }
  if (chunk) chunks.push(chunk.trim());

  return chunks;
}
