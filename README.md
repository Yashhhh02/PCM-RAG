# PCM Study Assistant

A RAG-based AI chatbot for Class 11 and 12 students (India, NCERT syllabus) for Physics, Chemistry, and Maths.

## Features
- **NCERT Context**: Answers are strictly generated from ingested NCERT PDFs.
- **LaTeX Math Rendering**: Formulas are beautifully rendered using KaTeX.
- **Fallback Models**: Prioritizes OpenRouter free models (Gemma, Qwen, Nemotron) and falls back to Gemini 1.5 Flash if rate limits are hit.
- **Cost-Free**: Runs entirely on free tiers (Supabase, Vercel, Gemini, OpenRouter).

## Setup & Deployment

### 1. Database (Supabase)
Create a new Supabase project and execute the SQL schema in `supabase/schema.sql` to setup `pgvector` and the `match_chunks` function.

### 2. Environment Variables
Create a `.env.local` (and add these to Vercel during deployment):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Ingesting PDFs
Place your NCERT PDF files into `data/<subject>/<class>/<chapter>.pdf`.
Run the ingestion script:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python scripts/ingest.py
```

### 4. Running Locally
```bash
npm install
npm run dev
```

### 5. Deploying to Vercel (Phase 7)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for PCM Assistant"
   git branch -M main
   git remote add origin https://github.com/your-username/pcm-rag.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add all 5 keys from your `.env.local` file.
5. Click **Deploy**!
