
import os
import time
import logging
from google import genai
import json
import re
import requests
from sklearn.cluster import AgglomerativeClustering
import numpy as np

logger = logging.getLogger(__name__)

gemini_client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Fallback generation models in priority order
PRIMARY_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite')
GENERATION_MODELS = [
    PRIMARY_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
]
# Deduplicate while preserving order
GENERATION_MODELS = list(dict.fromkeys(GENERATION_MODELS))


def generate_content_with_retry_and_fallback(prompt, models=None, max_retries_per_model=2):
    """
    Attempts generation with primary model, retries with exponential backoff on transient errors
    (503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, 500, 502, 504), and gracefully falls back to alternate
    models in the chain if a model is unavailable or overloaded.
    """
    if models is None:
        models = GENERATION_MODELS

    last_error = None
    for model_name in models:
        for attempt in range(max_retries_per_model):
            try:
                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and hasattr(response, 'text') and response.text:
                    return response
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                is_transient = any(code in err_str for code in [
                    '503', 'unavailable', 'high demand', 'spikes in demand',
                    '429', 'resource_exhausted', 'rate limit', 'overloaded',
                    '500', '502', '504', 'deadline_exceeded'
                ])
                logger.warning(
                    f"Gemini attempt {attempt + 1}/{max_retries_per_model} on model '{model_name}' failed: {e}"
                )

                # If deprecated or not found (404), skip immediately to next model
                if '404' in err_str or 'not_found' in err_str or 'no longer available' in err_str:
                    break

                if is_transient and attempt < max_retries_per_model - 1:
                    sleep_time = 1.0 * (2 ** attempt)
                    time.sleep(sleep_time)
                    continue
                else:
                    # Switch to next fallback model
                    break

    logger.error(f"All Gemini generation models failed. Last error: {last_error}")
    raise last_error


def get_gemini_embeddings(texts):
    if isinstance(texts, str):
        texts = [texts]
        
    try:
        # Dynamically find an available embedding model
        model_name = 'text-embedding-004' # Fallback default
        for m in gemini_client.models.list():
            if 'embedContent' in m.supported_actions or 'embed' in m.name:
                model_name = m.name
                break
                
        response = gemini_client.models.embed_content(
            model=model_name,
            contents=texts,
            config={'output_dimensionality': 768}
        )
        return [np.array(e.values) for e in response.embeddings]
    except Exception as e:
        raise Exception(f"Gemini API Embedding failed: {e}")


def retrieve_relevant_chunks(bot_id, question, top_k=5):
    from pgvector.django import CosineDistance
    from bots.models import KnowledgeChunk
    
    try:
        question_embedding = get_gemini_embeddings(question)[0]
    
        db_chunks = KnowledgeChunk.objects.filter(bot_id=bot_id).annotate(
            distance=CosineDistance('embedding', question_embedding.tolist())
        ).order_by('distance')[:top_k]
        
        return [
            (
                c.content, 
                c.distance, 
                {
                    'source_id': c.source_id,
                    'source_name': c.source_name,
                    'source_type': c.source_type,
                }
            ) for c in db_chunks
        ]
    except Exception as e:
        print(f"Retrieval query failed for bot {bot_id}: {e}")
        return []



def store_chunks(bot_id,source,chunks,embeddings):
    from bots.models import KnowledgeChunk
    
    source_name = (
        source.file.name.split('/')[-1] if source.file
        else source.source_url if source.source_url
        else f"Text note ({source.created_at.strftime('%b %d, %Y')})"
    )
    
    knowledge_chunks = []
    
    for i in range(len(chunks)):
        knowledge_chunks.append(KnowledgeChunk(
            bot_id=bot_id,
            source_id=str(source.id),
            source_name=source_name,
            source_type=source.source_type,
            content=chunks[i],
            embedding=embeddings[i].tolist()
        ))
        
    KnowledgeChunk.objects.bulk_create(knowledge_chunks)


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


def embed_chunks(chunks, batch_size=5):
    all_embeddings = []
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        batch_embeddings = get_gemini_embeddings(batch)
        all_embeddings.extend(batch_embeddings)
    return np.array(all_embeddings)


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
    
    try:
        response = generate_content_with_retry_and_fallback(prompt)
        answer_text = response.text.strip()
    except Exception as e:
        logger.error(f"Failed to generate answer for bot {getattr(bot, 'id', 'unknown')}: {e}")
        return fallback_message, []
    
    if answer_text == fallback_message.strip():
        return answer_text, []

    citations = []
    seen = set()
    for _, _, metadata in relevant_chunks:
        if metadata.get('source_id') in seen:
            continue
        seen.add(metadata.get('source_id'))
        citations.append({
            'id': metadata.get('source_id'),
            'name': metadata.get('source_name'),
            'type': metadata.get('source_type'),
        })
    return answer_text, citations


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
    
    try:
        response = generate_content_with_retry_and_fallback(prompt, max_retries_per_model=1)
        raw_text = response.text.strip()
        # Clean potential markdown wrapping
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
        data = json.loads(raw_text)
        if data.get('name') or data.get('phone') or data.get('email'):
            return data
        return None
    except Exception as e:
        logger.warning(f"Lead info extraction skipped or failed gracefully: {e}")
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