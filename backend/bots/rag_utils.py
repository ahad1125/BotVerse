import chromadb
import os
from google import genai
import json
import re
from sklearn.cluster import AgglomerativeClustering
import numpy as np


gemini_client=genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

chroma_client=chromadb.PersistentClient(path='./chromadb/')

def get_gemini_embeddings(texts):
    if isinstance(texts, str):
        texts = [texts]
    try:
        response = gemini_client.models.embed_content(
            model="text-embedding-004",
            contents=texts,
        )
        return [np.array(e.values) for e in response.embeddings]
    except Exception as e:
        print(f"Gemini embedding API failed: {e}")
        # text-embedding-004 has 768 dimensions
        return [np.zeros(768) for _ in texts]

def retrieve_relevant_chunks(bot_id, question, top_k=3):
    
    collection = get_bot_collection(bot_id)
    
    if collection.count() == 0:
        return []
    
    question_embedding = get_gemini_embeddings(question)[0]
    
    try:
        results = collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=top_k
        )
    except Exception as e:
        print(f"ChromaDB query failed for bot {bot_id}: {e}")
        return []
    
    chunks = results['documents'][0]
    distances = results['distances'][0]
    metadatas = results['metadatas'][0]
    
    return list(zip(chunks, distances, metadatas))

def get_bot_collection(bot_id):
    
    collection_name=f'bot_{bot_id}'
    
    collection=chroma_client.get_or_create_collection(name=collection_name,
         configuration={'hnsw':{'space':'cosine'}})
    return collection



def store_chunks(bot_id,source,chunks,embeddings):
    
    collection=get_bot_collection(bot_id)
    
    
    ids=[f'{source.id}_{i}' for i in range(len(chunks))]
    
    
    source_name = (
        source.file.name.split('/')[-1] if source.file
        else source.source_url if source.source_url
        else f"Text note ({source.created_at.strftime('%b %d, %Y')})"
    )
    
    
    
    metadatas=[
        {
        'source_id':str(source.id),
        'source_name':source_name,
        'source_type':source.source_type,
        } for _ in chunks]
    
    
    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=chunks,
        metadatas=metadatas,
    )    


def chunk_text(text, chunk_size=800, overlap=150):

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    start = 0
    text_length = len(text)
    
    
    while start < text_length:

        end = min(start + chunk_size, text_length)

        ...

        chunk = text[start:end]
        chunks.append(chunk)

        # We've reached the end of the document.
        if end == text_length:
            break

        start = end - overlap

    
    return chunks


def embed_chunks(chunks):
    emdeddings = np.array(get_gemini_embeddings(chunks))
    return emdeddings


def generate_answer(bot,question,retreived_chunks,fallback_message,confidence_threshold=0.9,lead_captured=False):
    
    
    
    if not retreived_chunks:
        if not lead_captured:
            return fallback_message, []

    best_distance = retreived_chunks[0][1] if retreived_chunks else None

    if best_distance is not None and best_distance > confidence_threshold and not lead_captured:
        return fallback_message, []

    relevant_chunks = [c for c in retreived_chunks if c[1] <= confidence_threshold]

    context = "\n\n".join(chunk for chunk, distance, metadata in relevant_chunks) if relevant_chunks else ""


    
    
    
    lead_instruction=''
    
    business_name = bot.business_name or bot.name
    
    if lead_captured:
        lead_instruction = """
            The customer has already provided their contact information.

            Thank them briefly.

            Do not ask for their contact details again.

            Confirm that someone from the business will contact them soon.
            """
    
    prompt = f"""
    You are the AI assistant for :
    
    Business name:
    {business_name}

    Business tone:
    {bot.tone}
    
    Business category:
    {bot.category}


    
    Always respond in this language:
    {bot.language}

    Answer as if you work for this business.

    Never mention:
    - documents
    - context
    - knowledge base
    - provided information

    Answer naturally.

    Keep responses concise.

    Usually respond in 2-4 sentences.

    Only write longer answers if the customer explicitly asks.

    Never invent facts.

    Use only the business information below to answer.

    If the answer cannot be found there, return the fallback message.

    If the answer is not contained in the business knowledge, reply exactly:

    "{fallback_message}"
    
    If the customer asks whether you offer something, and it is not explicitly mentioned in the business knowledge, do not assume the answer is no or yes — treat it as unknown and return the fallback message.

    Do not guess.
    Do not make assumptions.

    Write only plain conversational text.

    No markdown.

    No bullet points.

    No headings.

    Ask for the contact details only once.
    If the customer already shared them, never ask again.

    Only ask for a customer's name and phone number when they clearly intend to:

    - book
    - purchase
    - request a quote
    - request a callback
    - place an order
    - schedule an appointment

    Never ask for contact information during casual questions.

    {lead_instruction}

    Business knowledge:

    --------------------
    {context}
    --------------------

    Answer ONLY using the business knowledge above.

    You may summarize or reorganize it.

    If multiple products or prices are listed,
    mention them naturally.

    If the answer is reasonably supported by the business knowledge,
    answer it.

    Only return the fallback message when the answer truly cannot be determined.    

    Customer Message:

    {question}
    
    Assistant: 
    """
    
    response=gemini_client.models.generate_content(
        # model='gemini-3.5-flash',
        # model='gemini-2.5-flash-lite',
        model='gemini-3.1-flash-lite',
        contents=prompt
    )
    
    print([(m['source_name'], d) for _, d, m in retreived_chunks])
    
    if response.text.strip() == fallback_message.strip():
        return response.text, []

    
    citations=[]
    seen=set()
    for _,_, metadata in relevant_chunks:
        
        
        if metadata['source_id'] in seen:
            continue
        
        seen.add(metadata['source_id'])
        
        citations.append({
            'id':metadata['source_id'],
            'name':metadata['source_name'],
            'type':metadata['source_type'],
        })
    return response.text,citations


def extract_lead_info(message_text):
    
    
    prompt = f"""
        Analyze this customer message.

        If the customer provides their own contact information,
        extract it.

        Return ONLY valid JSON.

        Format:

        {{
          "name": "",
          "phone": "",
          "email": ""
        }}

        Message:

        {message_text}
        """
    
    response=gemini_client.models.generate_content(
        # model='gemini-3.5-flash',
        # model='gemini-2.5-flash-lite',
        model='gemini-3.1-flash-lite',
        contents=prompt
    )
    
    
    try:
        data=json.loads(response.text.strip())
        if data.get('name') or data.get('phone') or data.get('email'):
            return data
        return None
    
    except (AttributeError,json.JSONDecodeError):
        return None
        
    


def cluster_similar_questions(questions,distance_threshold=0.3):
    
    if not questions:
        return []
    
    
    
    embeddings = np.array(get_gemini_embeddings(questions))
    
    clustering=AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=distance_threshold,
        metric='cosine',
        linkage='average'
    )
    
    labels=clustering.fit_predict(embeddings)
    
    clusters={}
    
    for question,label in zip(questions,labels):
        clusters.setdefault(label,[]).append(question)
        
    result=[
        {'representative_question':members[0],'count':len(members)}
        for members in clusters.values()
    ]
    
    result.sort(key=lambda c : c['count'],reverse=True)
    
    
    
    return result
    
    
def might_contain_lead_info(message_text):
    
    has_digits=bool(re.search(r'\d{4,}',message_text))
    has_email_like='@' in message_text
    has_name_keywords=any(word in message_text.lower() for word in [
    "my name",
    "i'm",
    "i am",
    "call me",
    "contact me",
    "reach me",
    "my phone",
    "my number",
    "email me"
])
    return has_digits or has_email_like or has_name_keywords