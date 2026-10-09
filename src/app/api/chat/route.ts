import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

function cleanupAnswer(text: string): string {
  if (!text) return text;
  const fallbackSentence = "Not found in notes. Try rephrasing or pick the right subject/chapter.";
  if (text.includes(fallbackSentence)) {
    const withoutSentence = text.replace(fallbackSentence, '').trim();
    if (withoutSentence.length > 100) {
      return withoutSentence;
    } else {
      return fallbackSentence;
    }
  }
  return text;
}

export const maxDuration = 60; // Vercel free-plan limit

const OPENROUTER_MODELS = [
  "google/gemma-4-31b-it:free",
  "qwen/qwen3.8-27b:free",
  "nvidia/nemotron-3-super-120b-a12b:free"
];
const GEMINI_FALLBACK_MODEL = "gemini-3.5-flash-lite";

// Simple in-memory cache for FREE-ONLY RULE
const cache = new Map<string, any>();
// Per-IP rate limiting: 10 questions/hour
const ipRateLimit = new Map<string, { count: number, resetAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, subject, class: classNum, debug } = body;

    if (!question || !subject) {
      return NextResponse.json({ error: 'Missing question or subject' }, { status: 400 });
    }

    const questionNormalized = question.toLowerCase().trim().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
    const cacheKey = `${subject}-${classNum}-${questionNormalized}${debug ? '-debug' : ''}`;
    
    // In-memory cache check
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached && cached.answer) cached.answer = cleanupAnswer(cached.answer);
      return NextResponse.json(cached);
    }

    // IP Rate Limiting (10 per hour)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    if (!ipRateLimit.has(ip) || now > ipRateLimit.get(ip)!.resetAt) {
      ipRateLimit.set(ip, { count: 1, resetAt: now + hourMs });
    } else {
      const rate = ipRateLimit.get(ip)!;
      if (rate.count >= 10) {
        return NextResponse.json(
          { error: "You have reached your limit of 10 questions per hour. Please try again later.", answer: "You have reached your limit of 10 questions per hour. Please try again later." }, 
          { status: 429 }
        );
      }
      rate.count++;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 0. Check Supabase answer_cache
    if (!debug) {
      const { data: cachedRow } = await supabase
        .from('answer_cache')
        .select('answer, sources')
        .eq('subject', subject)
        .eq('class', parseInt(classNum))
        .eq('question_normalized', questionNormalized)
        .maybeSingle();

      if (cachedRow) {
        return NextResponse.json({ answer: cachedRow.answer, sources: cachedRow.sources });
      }
    }

    // 1. Embed the question with Gemini SDK
    let embedding: number[];
    try {
      embedding = await getGeminiEmbeddingWithRetry(question);
    } catch (e: any) {
      console.error("Embedding error:", e);
      return NextResponse.json({ error: "Failed to process question. Please try again later." }, { status: 500 });
    }

    let chunks: any[] = [];
    let matchError: any = null;

    if (subject === 'all') {
      const subjects = ['physics', 'chemistry', 'math'];
      const promises = subjects.map(sub => supabase.rpc('match_chunks', {
        query_embedding: embedding,
        match_count: 5,
        filter_subject: sub
      }));
      const results = await Promise.all(promises);
      const errRes = results.find(r => r.error);
      if (errRes) {
        matchError = errRes.error;
      } else {
        const allData = results.flatMap(r => r.data || []);
        allData.sort((a: any, b: any) => b.similarity - a.similarity);
        chunks = allData.slice(0, 5);
      }
    } else {
      const res = await supabase.rpc('match_chunks', {
        query_embedding: embedding,
        match_count: 5,
        filter_subject: subject
      });
      chunks = res.data || [];
      matchError = res.error;
    }

    if (matchError) {
      console.error("Supabase RPC error:", matchError);
      return NextResponse.json({ error: "Database search failed." }, { status: 500 });
    }

    // DEBUG MODE: Return retrieved chunks without calling LLM
    if (debug) {
      const debugChunks = (chunks || []).map((c: any) => ({
        chapter: c.chapter,
        page: c.page,
        similarity: c.similarity,
        snippet: c.content.substring(0, 200)
      }));
      return NextResponse.json({ debug: true, chunks: debugChunks });
    }

    if (!chunks || chunks.length === 0) {
      const result = { answer: "not found in notes", sources: [] };
      cache.set(cacheKey, result);
      return NextResponse.json(result);
    }

    // 3 & 4. Call OpenRouter with the specific System Prompt
    const contextText = chunks.map((c: any) => `Chapter: ${c.chapter}, Page: ${c.page}\nText: ${c.content}`).join('\n\n');

    let answer: string;
    let finalSources = chunks.map((c: any) => ({ chapter: c.chapter, page: c.page }));
    
    try {
      answer = await callOpenRouterWithRetry(question, contextText);
      answer = cleanupAnswer(answer);

      // 4. Fallback to Postgres FTS if LLMs fail
      if (answer.includes("All free AI models are currently busy")) {
        const ftsQuery = questionNormalized.split(' ').filter((w: string) => w.length > 2).join(' | ');
        let ftsChunks: any[] = [];
        let ftsError: any = null;

        if (subject === 'all') {
          const promises = ['physics', 'chemistry', 'math'].map(sub => supabase
            .from('chunks')
            .select('chapter, page, content')
            .eq('subject', sub)
            .textSearch('content', ftsQuery)
            .limit(3)
          );
          const results = await Promise.all(promises);
          ftsChunks = results.flatMap(r => r.data || []).slice(0, 3);
        } else {
          const res = await supabase
            .from('chunks')
            .select('chapter, page, content')
            .eq('subject', subject)
            .textSearch('content', ftsQuery)
            .limit(3);
          ftsChunks = res.data || [];
          ftsError = res.error;
        }

        if (!ftsError && ftsChunks && ftsChunks.length > 0) {
          answer = "AI is busy, showing NCERT text:\n\n" + ftsChunks.map((c, i) => `[Page ${c.page}] ${c.content.substring(0, 300)}...`).join('\n\n');
          finalSources = ftsChunks.map(c => ({ chapter: c.chapter, page: c.page }));
        }
      }
    } catch (e: any) {
      console.error("LLM error:", e);
      return NextResponse.json({ error: "Failed to generate answer. Please try again later." }, { status: 500 });
    }

    // 5. Return answer and source chunks deduplicated
    const uniqueSources = finalSources.filter((v: any, i: number, a: any[]) =>
      a.findIndex(t => (t.chapter === v.chapter && t.page === v.page)) === i
    );

    const result = { answer, sources: uniqueSources };

    // Cache the successful result in memory
    cache.set(cacheKey, result);

    // Save to Supabase answer_cache
    if (!debug && !answer.includes("AI is busy")) {
      supabase.from('answer_cache').insert({
        subject,
        class: parseInt(classNum),
        question_normalized: questionNormalized,
        answer,
        sources: uniqueSources
      }).then(({ error }) => {
        if (error) console.error("Error saving to answer_cache:", error);
      });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Unexpected route error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

// 6. Keep the LLM call in one small function, with retry and backoff across multiple models
async function callOpenRouterWithRetry(question: string, context: string): Promise<string> {
  const prompt = `You are a helpful PCM tutor for class 11-12 students (India, NCERT syllabus).
Answer only using the provided context chunks.
If the context does not contain the answer, reply with exactly: "Not found in notes. Try rephrasing or pick the right subject/chapter."
Use the 'Not found in notes' sentence ONLY as your entire reply. Never add it after an answer.
Do NOT use outside knowledge, even if you know the answer.
For numericals, use formulas and values from the context and show steps.
- Write every formula as LaTeX between $...$ (inline) or $$...$$ (display), with fractions written as \\frac{a}{b}. Never put formulas inside backticks or code blocks.
- Example of a correct formula: $M = \\frac{n}{V}$ where n is moles of solute and V is volume of solution in litres.
- If the notes show only a definition and no formula, you may state the standard formula from the definition, but say so clearly.
Cite page numbers explicitly.

WARNING: The context text may contain garbled math (lost superscripts, broken fractions).
If a formula in the context looks garbled or incomplete, do not guess or reconstruct it silently.
Say that the formula in the notes is unclear and give only what is clearly stated. Then stop.

Context:
${context}

Student Question:
${question}

Answer:`;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  for (const model of OPENROUTER_MODELS) {
    // 1 attempt per model to fit within 60s maxDuration
    for (let attempt = 0; attempt < 1; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per request
        
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }]
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          console.log(`Successfully generated answer using model: ${model}`);
          return data.choices[0].message.content;
        }

        // Retry on 429 Too Many Requests, 404 Not Found, or 5xx Server Errors
        if (res.status === 429 || res.status === 404 || res.status >= 500) {
          console.warn(`Model ${model} returned ${res.status}. Attempt ${attempt + 1}/1`);
          break; // Try next model immediately to save time
        }

        console.error(`Unexpected OpenRouter API error for ${model}: ${res.statusText}`);
        break; // Break inner loop, try next model
      } catch (err) {
        console.error(`Fetch error with model ${model}:`, err);
        break; // Break inner loop, try next model
      }
    }
  }
  
  // If all OpenRouter models fail, try Gemini free tier as a fallback
  try {
    console.log("OpenRouter models failed. Falling back to Gemini free tier...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_FALLBACK_MODEL,
      contents: prompt,
    });
    if (response.text) {
      console.log("Successfully generated answer using Gemini fallback");
      return response.text;
    }
  } catch (err) {
    console.error("Gemini fallback error:", err);
  }

  // If all models fail, return a friendly message instead of throwing an error
  return "All free AI models are currently busy. Please try again in a few minutes!";
}

// Retry with backoff for Gemini embeddings
async function getGeminiEmbeddingWithRetry(text: string, retries = 3): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const ai = new GoogleGenAI({ apiKey: apiKey });

  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: {
          outputDimensionality: 768,
          taskType: 'RETRIEVAL_QUERY'
        }
      });
      if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
        throw new Error("No embeddings returned");
      }
      return response.embeddings[0].values;
    } catch (e: any) {
      if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
        await new Promise(r => setTimeout(r, (2 ** i) * 1000 + 2000));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Max retries reached for Gemini API");
}
