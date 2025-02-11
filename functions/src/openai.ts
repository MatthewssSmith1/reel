import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"

const openaiKey = process.env.OPENAI_API_KEY!

export const llm = new ChatOpenAI({ 
  apiKey: openaiKey, 
  model: "gpt-4o-mini"
});

export const embeddings = new OpenAIEmbeddings({ 
  apiKey: openaiKey, 
  model: "text-embedding-3-small"
});