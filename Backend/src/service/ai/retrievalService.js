import { getEmbedding } from "./geminiClient.js";
import { pineconeIndex } from "../../config/pineconeClient.js";

export async function queryDocuments(query, docId, topK = 5) {
  const [queryEmbedding] = await getEmbedding([query]);

  const queryResponse = await pineconeIndex.query({
    vector: queryEmbedding.values,
    topK,
    includeMetadata: true,
    filter: {
      docId: docId,
    },
  });
  const results = queryResponse.matches
    .map((match) => ({
      chunk: match.metadata.chunk,
      score: match.score,
    }))
    .sort((a, b) => b.score - a.score);

  return results;
}
