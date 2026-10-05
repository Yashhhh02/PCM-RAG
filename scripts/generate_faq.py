import os
import sys
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials in environment.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_faq():
    API_URL = "http://localhost:3000/api/chat"
    print("Fetching all distinct chapters from the database...")
    
    # Query distinct chapters by fetching unique combinations
    # Since Supabase postgrest doesn't support distinct() nicely with multiple columns easily in standard API, 
    # we'll fetch them and filter locally, or use a custom RPC. Let's just fetch all chunks and extract unique chapters.
    chapters_set = set()
    
    # We loop through paginated results to get all chunks
    limit = 1000
    offset = 0
    while True:
        res = supabase.table("chunks").select("subject, class, chapter").range(offset, offset + limit - 1).execute()
        data = res.data
        if not data or len(data) == 0:
            break
        for row in data:
            # Only process if chapter is not null and not empty
            if row.get("chapter") and str(row.get("chapter")).strip() != "":
                chapters_set.add((row["subject"], row["class"], row["chapter"]))
        offset += limit
        
    print(f"Found {len(chapters_set)} distinct chapters in the database!")
    
    for subject, class_num, chapter in sorted(chapters_set):
        print(f"\\n--- Processing {subject.capitalize()} Class {class_num} - {chapter} ---")
                
        # 10 Common NCERT Questions
        questions = [
            f"What is the definition of the main concepts in {chapter}?",
            f"State the important laws in {chapter}.",
            f"What are the key formulas used in {chapter}?",
            f"What are the SI units and dimensions of quantities in {chapter}?",
            f"Explain the physical significance of the concepts in {chapter}.",
            f"Derive the main equations in {chapter}.",
            f"What are the limitations of the laws in {chapter}?",
            f"Give examples from daily life for {chapter}.",
            f"How do the principles of {chapter} apply to problem solving?",
            f"What are the important differences between concepts in {chapter}?"
        ]
        
        for q in questions:
            try:
                # Check if exists
                existing = supabase.table("faq").select("id").eq("subject", subject).eq("class", class_num).eq("chapter", chapter).eq("question", q).execute()
                
                if len(existing.data) > 0:
                    print(f"Skipping existing question: {q}")
                    continue
                    
                print(f"Asking: {q}")
                
                res = requests.post(API_URL, json={
                    "question": q,
                    "subject": subject,
                    "class": class_num
                })
                data = res.json()
                
                if "answer" in data and "busy" not in data["answer"].lower():
                    supabase.table("faq").insert({
                        "subject": subject,
                        "class": class_num,
                        "chapter": chapter,
                        "question": q,
                        "answer": data["answer"],
                        "sources": data.get("sources", [])
                    }).execute()
                    print("Saved to FAQ.")
                else:
                    print("Skipped due to AI busy or error:", data)
                    
                # Sleep/backoff to avoid rate limits
                time.sleep(15)
                
            except Exception as e:
                print("Error:", e)
                time.sleep(15)

if __name__ == "__main__":
    get_faq()
