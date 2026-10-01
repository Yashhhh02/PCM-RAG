# PCM Study Assistant: Project Specification

## PROJECT
**PCM Study Assistant**: a RAG-based AI chatbot for Class 11 and 12 students (India, NCERT syllabus) for Physics, Chemistry and Maths. A student selects subject and class, asks a doubt, and gets a step-by-step answer generated ONLY from the NCERT book content, with chapter and page references.

## USERS
- **Target Audience:** Class 11-12 students.
- **Language:** Explanations in simple English (Hinglish-friendly tone is OK).
- **Platform:** Mobile-first usage.

## TECH STACK
- **Frontend + Backend:** Next.js (App Router, TypeScript, Tailwind)
- **Database:** Supabase Postgres with pgvector
- **Embeddings:** Gemini `gemini-embedding-001`, output dimensionality 768
- **LLM:** OpenRouter, free-tier model (model name kept as a constant)
- **Ingestion:** Python script with PyMuPDF
- **Hosting:** Vercel
- **Cost constraint:** Everything must work on free tiers.

## DATA
NCERT PDFs placed manually in the directory structure:
`data/<subject>/<class>/<chapter>.pdf`
(e.g., `data/physics/class11/laws-of-motion.pdf`)
Subject and class metadata are derived from folder names.

## CORE FEATURES (MVP)
1. **Ingestion:** Extract text per page, chunk (~600 tokens, 100 overlap), embed using Gemini, and store in Supabase with metadata (subject, class, chapter, page).
2. **Retrieval:** Embed the user's question, retrieve top 5 chunks via `match_chunks` SQL function, filtered by the selected subject.
3. **Answering:** LLM answers strictly from retrieved context, step by step. Formulas formatted in LaTeX. Explicitly cites page numbers and chapter. If context is insufficient, LLM replies "not found in notes" (no hallucinations/guessing).
4. **Chat UI:** Subject + class dropdowns, message list, formulas rendered with KaTeX, sources shown under each answer, loading state.

*Out of scope for now:* Login, chat history, image/diagram questions, payments, admin panel.

## SECURITY RULES
- Never share or ask to paste API keys in chat. Read keys only from `.env.local` via `process.env` / `python-dotenv`.
- `.env.local`, `venv/` and `node_modules` must be gitignored.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side code and scripts, never in client components.
- **Env variable names:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENROUTER_API_KEY`
  - `GEMINI_API_KEY`

## FREE-ONLY RULE
- Every service must stay on its free tier. Never use a paid API, paid model, or anything that needs a credit card.
- OpenRouter: only model IDs ending in ":free". Keep the model name in one constant.
- Free tier limits are strict (OpenRouter ~50 requests/day, Gemini has per-minute limits), so add retry with backoff, friendly error messages, and a simple cache so repeated questions do not use requests again.
- Keep the LLM call in one small function so the provider can be swapped (OpenRouter free model or Gemini free tier) without touching the rest.

## WORKING RULES
- Work in phases. After finishing each phase, STOP, summarize what was done, and provide exact manual steps required (run SQL, add keys, add PDFs, run commands) and how to test.
- Do not start the next phase until explicit "next" approval is given.
- Keep code simple and well-commented for educational purposes.
- If something is unclear or a choice is needed, ask for clarification.
- Explicitly state any manual steps required (Supabase SQL Editor, adding keys, placing PDFs); do not pretend to automate them.

## PHASES
1. **Project setup:** Init Next.js, Python environment, folder structure.
2. **Database schema:** SQL script for Supabase tables and pgvector functions.
3. **Ingestion script:** Python script to parse PDFs, chunk, embed, and push to Supabase.
4. **Chat API:** Next.js Route Handler for retrieval and LLM generation.
5. **UI:** Chat interface with KaTeX rendering, dropdowns, and source citations.
6. **Testing and quality fixes:** End-to-end testing, edge cases.
7. **Deploy:** Vercel deployment.
