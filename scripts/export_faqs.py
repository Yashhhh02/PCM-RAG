import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('.env.local')
supabase = create_client(os.environ['NEXT_PUBLIC_SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])

res = supabase.table('faq').select('*').order('subject').order('class').order('chapter').execute()
faqs = res.data

content = '# PCM-RAG Pre-Generated Question Bank\n\n'
content += 'This document contains all the pre-generated questions and answers that have been populated in the database for instant, zero-cost access.\n\n'

current_subject = ''
current_class = ''
current_chapter = ''

for faq in faqs:
    if faq['subject'] != current_subject:
        current_subject = faq['subject']
        content += f'# Subject: {current_subject.capitalize()}\n\n'
        
    if str(faq['class']) != current_class:
        current_class = str(faq['class'])
        content += f'## Class: {current_class}\n\n'
        
    if faq['chapter'] != current_chapter:
        current_chapter = faq['chapter']
        content += f'### Chapter: {current_chapter}\n\n'
        
    content += f'**Q: {faq["question"]}**\n\n'
    content += f'**A:** {faq["answer"]}\n\n'
    content += '---\n\n'

with open('Generated_FAQs.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully exported to Generated_FAQs.md')
