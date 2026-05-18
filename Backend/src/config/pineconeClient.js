import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey:
    "pcsk_24fQrP_EUBa6PrQaFDmUtrvqP28fbN322AuneqEFxj4bXraNR8qpF1XL8tKFTYnn54zb13",
});

export const pineconeIndex = pinecone.index("legalmind");
