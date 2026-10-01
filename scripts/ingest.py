import os
import re
import sys
import time
import argparse
import logging
import fitz  # PyMuPDF
from supabase import create_client, Client
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

# Load environment variables
load_dotenv(".env.local")

class QuotaExceededError(Exception):
    pass


def get_supabase_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        logging.error("Missing Supabase URL or Service Role Key in .env.local")
        sys.exit(1)
    return create_client(url, key)

def get_gemini_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logging.error("Missing GEMINI_API_KEY in .env.local")
        sys.exit(1)
    return genai.Client(api_key=api_key)

def clean_text(text: str) -> str:
    """Clean up extra whitespace and remove common headers/footers (basic heuristic)."""
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r' +', ' ', text)
    # Strip leading/trailing whitespaces from each line
    lines = [line.strip() for line in text.split('\n')]
    
    # Very basic header/footer removal (removing very short first/last lines)
    if lines and len(lines[0]) < 20 and re.match(r'^[0-9]+$|^chapter|^physics|^chemistry|^math', lines[0].lower()):
        lines = lines[1:]
    if lines and len(lines[-1]) < 20 and re.match(r'^[0-9]+$|^reprint', lines[-1].lower()):
        lines = lines[:-1]
        
    return '\n'.join(lines).strip()

def chunk_text(text: str, page_num: int, chunk_size=450, overlap=75):
    """
    Split text into chunks of approx `chunk_size` words with `overlap` words.
    450 words is roughly 600 tokens.
    Returns list of tuples: (chunk_text, page_num)
    """
    words = text.split()
    chunks = []
    if not words:
        return chunks
    
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append((chunk, page_num))
        i += (chunk_size - overlap)
    return chunks

def file_already_ingested(supabase: Client, subject: str, class_num: int, chapter: str) -> bool:
    """Check if the chapter is already in the database."""
    try:
        res = supabase.table('chunks').select('id').eq('subject', subject).eq('class', class_num).eq('chapter', chapter).limit(1).execute()
        return len(res.data) > 0
    except Exception as e:
        logging.error(f"Error checking database for existing file: {e}")
        return False

def get_embeddings_in_batches(gemini_client: genai.Client, chunks: list, batch_size=5, retries=5):
    """
    Generate embeddings for chunks in batches.
    FREE-ONLY RULE: Sleeps between batches and uses exponential backoff on 429.
    """
    all_embeddings = []
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        batch_texts = [c[0] for c in batch]
        
        success = False
        for attempt in range(retries):
            try:
                response = gemini_client.models.embed_content(
                    model='gemini-embedding-001',
                    contents=batch_texts,
                    config=types.EmbedContentConfig(output_dimensionality=768, task_type='RETRIEVAL_DOCUMENT')
                )
                
                # Check response structure to extract embeddings
                if isinstance(response.embeddings, list):
                    batch_embeddings = [emb.values for emb in response.embeddings]
                else:
                    batch_embeddings = [response.embeddings.values]
                    
                all_embeddings.extend(batch_embeddings)
                success = True
                logging.info(f"Successfully embedded chunk batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")
                break
            except Exception as e:
                error_str = str(e).lower()
                logging.warning(f"Embedding batch {i//batch_size + 1} failed (attempt {attempt+1}/{retries}): {e}")
                if attempt == retries - 1:
                    if '429' in error_str or 'quota' in error_str or 'too many' in error_str:
                        raise QuotaExceededError("Daily quota reached, run again tomorrow")
                    logging.error("Max retries reached for embedding batch.")
                    raise e
                
                # Exponential backoff, especially for 429 Too Many Requests
                sleep_time = (2 ** attempt) + 2
                if '429' in error_str or 'quota' in error_str or 'too many' in error_str:
                    sleep_time += 10  # Add extra delay for rate limits
                logging.info(f"Sleeping for {sleep_time} seconds before retrying...")
                time.sleep(sleep_time)
                
        # Free-tier limit respect: sleep between successful batches to avoid hitting 15 RPM
        time.sleep(5)
        
    return all_embeddings

def process_pdf(filepath: str, args, supabase: Client, gemini_client: genai.Client):
    parts = os.path.normpath(filepath).split(os.sep)
    if len(parts) < 4:
        logging.warning(f"Skipping {filepath}: Path structure must be data/subject/class/chapter.pdf")
        return

    subject = parts[-3]
    class_str = parts[-2]
    chapter_file = parts[-1]
    
    class_match = re.search(r'\d+', class_str)
    class_num = int(class_match.group()) if class_match else 0
    chapter = chapter_file.lower().replace('.pdf', '')

    logging.info(f"--- Processing: {subject} | Class {class_num} | {chapter} ---")

    if not args.dry_run and file_already_ingested(supabase, subject, class_num, chapter):
        logging.info(f"Skipping {chapter}: Already ingested.")
        return

    try:
        doc = fitz.open(filepath)
    except Exception as e:
        logging.error(f"Failed to open {filepath}: {e}")
        return

    all_chunks = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        cleaned_text = clean_text(text)
        
        if not cleaned_text:
            continue
            
        # 1-indexed page numbers
        page_chunks = chunk_text(cleaned_text, page_num + 1)
        all_chunks.extend(page_chunks)

    if not all_chunks:
        logging.info("No text found in PDF.")
        return

    logging.info(f"Extracted {len(all_chunks)} chunks from {len(doc)} pages.")

    if args.dry_run:
        logging.info("DRY RUN: Displaying first 3 chunks...")
        for idx, (txt, p_num) in enumerate(all_chunks[:3]):
            print(f"\n--- Chunk {idx+1} (Page {p_num}) ---\n{txt[:200]}...\n")
        return

    logging.info("Starting embedding generation...")
    try:
        embeddings = get_embeddings_in_batches(gemini_client, all_chunks, batch_size=5)
    except QuotaExceededError as e:
        raise e
    except Exception as e:
        logging.error(f"Aborting insertion for {chapter} due to embedding failure.")
        return

    if len(embeddings) != len(all_chunks):
        logging.error("Mismatch between number of chunks and embeddings generated. Aborting.")
        return

    # Prepare rows for insertion
    rows = []
    for (chunk_txt, p_num), emb in zip(all_chunks, embeddings):
        rows.append({
            "content": chunk_txt,
            "subject": subject,
            "class": class_num,
            "chapter": chapter,
            "page": p_num,
            "embedding": emb
        })

    # Insert into Supabase in batches of 50
    db_batch_size = 50
    logging.info(f"Inserting {len(rows)} rows into Supabase in batches of {db_batch_size}...")
    
    for i in range(0, len(rows), db_batch_size):
        batch_rows = rows[i:i+db_batch_size]
        success = False
        for attempt in range(3):
            try:
                supabase.table('chunks').insert(batch_rows).execute()
                success = True
                logging.info(f"Inserted DB batch {i//db_batch_size + 1}/{(len(rows)-1)//db_batch_size + 1}")
                break
            except Exception as e:
                logging.warning(f"DB Insert failed (attempt {attempt+1}/3): {e}")
                time.sleep(2 ** attempt)
        if not success:
            logging.error(f"Failed to insert DB batch {i//db_batch_size + 1}. Moving to next batch.")
            
    logging.info(f"Completed {chapter}.")

def main():
    parser = argparse.ArgumentParser(description="Ingest NCERT PDFs into Supabase.")
    parser.add_argument("--dry-run", action="store_true", help="Extract and chunk only. No API calls or DB writes.")
    args = parser.parse_args()

    data_dir = "data"
    if not os.path.exists(data_dir):
        logging.error(f"Directory '{data_dir}' not found.")
        return

    supabase = None
    gemini_client = None
    
    if not args.dry_run:
        supabase = get_supabase_client()
        gemini_client = get_gemini_client()

    pdf_files = []
    for root, dirs, files in os.walk(data_dir):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, file))
                
    if not pdf_files:
        logging.info(f"No PDFs found in the '{data_dir}' directory.")
        return
        
    logging.info(f"Found {len(pdf_files)} PDF(s) to process.")
    
    for filepath in pdf_files:
        try:
            process_pdf(filepath, args, supabase, gemini_client)
        except QuotaExceededError as e:
            logging.error(f"SCRIPT STOPPED: {e}")
            break

if __name__ == "__main__":
    main()
