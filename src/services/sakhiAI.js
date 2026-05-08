// src/services/sakhiAI.js
// TODO: In production, route these calls through a Firebase Cloud Function
//       to keep API keys off the client device.

import { buildRAGPrompt } from './ragService';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Timeout helper ────────────────────────────────────────────────────────────
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Convert history from OpenAI format → Gemini format ───────────────────────
function convertHistoryForGemini(history) {
  return history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

function buildLocalRagReply(userMessage, chunks) {
  if (!chunks.length) {
    return [
      "I’m here with you. I couldn’t find a matching knowledge-base entry, but I can still help with period comfort, cramps, and basic wellness support.",
      "If pain is severe or unusual, please consult a healthcare professional.",
      "I'm an AI companion, not a doctor. If pain is severe or unusual, please consult a healthcare professional.",
    ].join('\n\n');
  }

  const topChunks = chunks.slice(0, 3);
  const guidanceLines = topChunks.map((chunk) => `- ${chunk.title}: ${chunk.content}`);

  return [
    "I’m here for you. Based on the knowledge base, these are the most relevant comfort tips:",
    ...guidanceLines,
    "Try the first one or two options that feel easiest right now, and rest with a heating pad if you have one.",
    "If pain is severe or unusual, please consult a healthcare professional.",
    "I'm an AI companion, not a doctor. If pain is severe or unusual, please consult a healthcare professional.",
  ].join('\n\n');
}

// ── Groq API call ─────────────────────────────────────────────────────────────
async function callGroq(userMessage, systemPrompt, history) {
  const response = await withTimeout(
    fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,         // low = more factual
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
      }),
    }),
    8000  // 8 second timeout
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

// ── Gemini API call (fallback) ────────────────────────────────────────────────
async function callGemini(userMessage, systemPrompt, history) {
  const geminiHistory = convertHistoryForGemini(history);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...geminiHistory,
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ── MAIN FUNCTION ─────────────────────────────────────────────────────────────
export async function askSakhiKnows(userMessage, conversationHistory = []) {
  // Step 1: RAG — retrieve relevant chunks and build system prompt
  const { systemPrompt, hasContext, chunks } = buildRAGPrompt(userMessage);

  // Step 2: Try Groq first (primary AI)
  try {
    console.log('[Sakhi] Trying Groq...');
    const reply = await callGroq(userMessage, systemPrompt, conversationHistory);
    if (reply) {
      console.log('[Sakhi] Groq responded successfully');
      return { reply, provider: 'Groq', hasContext, chunks, error: null };
    }
    console.warn('[Sakhi] Groq returned an empty reply');
  } catch (groqError) {
    console.warn('[Sakhi] Groq failed:', groqError.message);
  }

  // Step 3: Fallback to Gemini (only if Groq fails)
  try {
    console.log('[Sakhi] Falling back to Gemini...');
    const reply = await callGemini(userMessage, systemPrompt, conversationHistory);
    console.log('[Sakhi] Gemini responded successfully');
    return { reply, provider: 'Gemini', hasContext, chunks, error: null };
  } catch (geminiError) {
    console.error('[Sakhi] Gemini also failed:', geminiError.message);
    return {
      reply: buildLocalRagReply(userMessage, chunks),
      provider: 'Local RAG',
      hasContext,
      chunks,
      error: geminiError.message,
    };
  }
}