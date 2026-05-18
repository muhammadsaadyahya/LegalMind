import { getEmbedding } from "./geminiClient.js";
import { chunkText } from "../../utils/textChunker.js";
import { pineconeIndex } from "../../config/pineconeClient.js";

export async function ingestDocument(docId, docText) {
  const chunks = chunkText(docText);
  Console.log("Started");
  const embeddingResults = await getEmbedding(chunks);

  const embeddings = chunks.map((chunk, idx) => {
    return { chunk, embedding: embeddingResults[idx].values };
  });
  const vectors = embeddings.map(({ chunk, embedding }) => ({
    id: docId + "_" + Math.random().toString(36).substring(2, 9),
    metadata: { docId, chunk },
    values: embedding,
  }));
  console.log("Added to DB");
  const batchSize = 50;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await pineconeIndex.upsert(batch);
  }
  console.log("Done");
  return {
    message: "Document ingested successfully",
    chunksCount: chunks.length,
  };
}
