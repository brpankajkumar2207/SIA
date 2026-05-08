// src/services/ragService.js

import knowledge from '../data/sakhiKnowledge.json';
import { SAKHI_BASE_PROMPT } from '../constants/sakhiPrompt';

type KnowledgeChunk = {
  id: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
};

type ScoredChunk = KnowledgeChunk & {
  score: number;
};

// ── Tokenizer ────────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word: string) => word.length > 2);
}

// ── Score each knowledge entry against the user query ────────────────────────
function scoreDocument(query: string, doc: KnowledgeChunk): number {
  const queryTokens = tokenize(query);
  const docText = `${doc.content} ${doc.tags.join(' ')} ${doc.title}`;
  const docTokens = tokenize(docText);

  let score = 0;
  for (const qToken of queryTokens) {
    for (const dToken of docTokens) {
      if (qToken === dToken) score += 2;                              // exact match
      else if (qToken.includes(dToken) || dToken.includes(qToken)) score += 1; // partial
    }
  }
  return score;
}

// ── Retrieve top K relevant chunks ───────────────────────────────────────────
export function retrieveRelevantChunks(userQuery: string, topK = 3): ScoredChunk[] {
  const scored = (knowledge as KnowledgeChunk[]).map((doc) => ({
    ...doc,
    score: scoreDocument(userQuery, doc),
  }));

  return scored
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ── Format chunks into readable context block ─────────────────────────────────
function buildContextBlock(chunks: KnowledgeChunk[]): string {
  return chunks
    .map((chunk: KnowledgeChunk, i: number) => `[${i + 1}] ${chunk.title}\n${chunk.content}`)
    .join('\n\n');
}

// ── Build full system prompt with RAG context injected ────────────────────────
export function buildRAGPrompt(userQuery: string): {
  systemPrompt: string;
  hasContext: boolean;
  chunks: ScoredChunk[];
} {
  const chunks = retrieveRelevantChunks(userQuery);

  // No relevant chunks found — AI will politely refuse
  if (chunks.length === 0) {
    return {
      systemPrompt: `
${SAKHI_BASE_PROMPT}

IMPORTANT: No relevant information was found in the knowledge base for this query.
You MUST respond in English with:
"I don't have information about that in my knowledge base.
I can only help with period health, cramps, and Indian home remedies."
Do NOT use your general training knowledge.

      `,
      hasContext: false,
      chunks: [],
    };
  }

  const context = buildContextBlock(chunks);

  return {
    systemPrompt: `
${SAKHI_BASE_PROMPT}

CONTEXT FROM KNOWLEDGE BASE:
────────────────────────────
${context}
────────────────────────────

Answer ONLY from the context above. Nothing else.
    `,
    hasContext: true,
    chunks,
  };
}