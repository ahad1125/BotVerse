from celery import shared_task
from .models import Bot,KnowledgeSource
import requests
from pypdf import PdfReader
import pandas as pd
import re
from youtube_transcript_api import YouTubeTranscriptApi
from docx import Document
from bs4 import BeautifulSoup

from rest_framework.exceptions import ValidationError

from .rag_utils import chunk_text,embed_chunks,generate_answer,store_chunks


@shared_task
def test_task():
    print('Celery is Working')
    return 'success'


@shared_task
def process_knowledge_source(id):
    
    
    # print('in knowledge source function')
    try:
        source=KnowledgeSource.objects.get(id=id)
        print(source)
    except KnowledgeSource.DoesNotExist:
        print('Does not Exists')
        return
    
    # print(f"Processing source_type={source.source_type}")  # debug line
    
    
    try:
        
        if source.source_type=='text':
            
            text_content=source.text_content
            source.extracted_text=text_content
            
        elif source.source_type == 'pdf':
            source.file.open('rb')
            reader = PdfReader(source.file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() or ''
            source.file.close()
            source.extracted_text = text
        
        elif source.source_type == 'docx':
            source.file.open('rb')
            doc = Document(source.file)
            source.extracted_text = "\n".join(p.text for p in doc.paragraphs)
            source.file.close()
        
        elif source.source_type == 'csv':
            source.file.open('rb')
            df = pd.read_csv(source.file)
            source.extracted_text = df.to_string(index=False)
            source.file.close()
            
        elif source.source_type=='url':
            
            print('URL BRANCH')
            
            response=requests.get(source.source_url,timeout=10)
            soup=BeautifulSoup(response.content,'html.parser')
            for tag in soup(['script', 'style']):
                tag.decompose()

            text = soup.get_text(separator=" ", strip=True)
            
            print(text)
            
            
            
            source.extracted_text = text
            
            
            
        elif source.source_type=='youtube':
            
            
            video_id_match=re.search(r'(?:v=|youtu\.be/)([\w-]+)',source.source_url)
            if not video_id_match:
                raise ValueError('Could not extract video ID from URL')
            
            video_id=video_id_match.group(1)
            yt_api=YouTubeTranscriptApi()
            
            transcript=yt_api.fetch(video_id)
            text = " ".join(entry.text for entry in transcript)
            source.extracted_text=text
            

            
            
            
            
            
            
        else :
            print(f'No handler for source_type {source.source_type}')
        

        
        chunks=chunk_text(source.extracted_text)
        embeddings=embed_chunks(chunks)
        store_chunks(bot_id=source.bot.id,source=source,chunks=chunks,embeddings=embeddings)
        
        source.status='processed'
        source.save()
        
    except Exception as e:
        print(f'FAILED processing {id}: {e}')
        source.status='failure'
        source.save()
    

# @shared_task
# def process_knowledge_source(id):
#     print(f"TASK STARTED for id={id}")
#     try:
#         source = KnowledgeSource.objects.get(id=id)
#     except KnowledgeSource.DoesNotExist:
#         print(f"KnowledgeSource {id} NOT FOUND")
#         return

#     print(f"FOUND source, source_type={source.source_type}")

#     if source.source_type == 'text':
#         print("Entering text branch")
#         try:
#             source.extracted_text = source.text_content
#             source.status = 'processed'
#             source.save()
#             print("SAVED successfully")
#         except Exception as e:
#             print(f"FAILED: {e}")
#             source.status = 'failure'
#             source.save()
#     else:
#         print(f"No handler for source_type={source.source_type}")