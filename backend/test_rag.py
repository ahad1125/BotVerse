import django
import os
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'convera.settings')
django.setup()

import chromadb
from bots.rag_utils import chunk_text, embed_chunks, store_chunks, retrieve_relevant_chunks, generate_answer

# bot_id = "3d223fb3-7c81-4c7e-91db-272bb9a6f78f"  # your actual bot id

# # Step 1: delete old collection (stale chunks from old chunk_size)
# chroma_client = chromadb.PersistentClient(path="./chromadb")
# try:
#     chroma_client.delete_collection(f"bot_{bot_id}")
#     print("Old collection deleted.")
# except Exception as e:
#     print(f"No old collection to delete or error: {e}")

# # Step 2: re-chunk with smaller size, re-embed, re-store
# clinic_text = """Welcome to City Care Medical Clinic. We are a multi-specialty outpatient clinic located in Gulberg, Lahore, serving patients since 2015.

# Our clinic operates Monday to Saturday from 9:00 AM to 9:00 PM. We remain closed on Sundays and public holidays. During Ramadan, our timings shift to 10:00 AM to 7:00 PM to accommodate fasting hours for both staff and patients.

# Consultation Fees:
# General physician consultation costs Rs 1,500 for new patients and Rs 1,000 for follow-up visits within 15 days of the initial appointment. Specialist consultations, including cardiology, dermatology, and orthopedics, are priced at Rs 2,500 for new patients. Pediatric consultations are Rs 1,200 for children under 12 years of age.

# Our Doctors:
# Dr. Ahmed Raza is our senior general physician, available Monday, Wednesday, and Friday from 10:00 AM to 2:00 PM. Dr. Sara Khan, our cardiologist, sees patients on Tuesday and Thursday from 4:00 PM to 8:00 PM. Dr. Bilal Hussain, our dermatologist, is available every Saturday from 11:00 AM to 6:00 PM. Dr. Ayesha Malik, our pediatrician, sees patients daily except Sunday, from 9:00 AM to 1:00 PM.

# Appointment Booking:
# Patients can book appointments by calling our front desk at 042-1234567, through our website, or by walking in directly. We recommend booking at least one day in advance for specialist consultations, as walk-in slots for specialists are limited. General physician appointments can usually be accommodated same-day.

# Services Offered:
# We provide general check-ups, vaccination services, minor wound dressing, ECG testing, blood pressure monitoring, and basic laboratory tests including blood sugar, complete blood count, and urine analysis. Laboratory results are typically available within 24 hours, and patients are notified via SMS when results are ready.

# Vaccination Services:
# We offer routine vaccinations for children as per the national immunization schedule, as well as travel vaccinations including Hepatitis A, Typhoid, and Meningitis vaccines for patients traveling abroad. Flu vaccines are available seasonally, typically starting from October each year.

# Payment Methods:
# We accept cash, all major debit and credit cards, and JazzCash/EasyPaisa mobile payments. We currently do not accept cheques. Payment is due at the time of consultation unless prior arrangements have been made with our billing department.

# Insurance:
# We are empaneled with several major health insurance providers including State Life, Jubilee Insurance, and EFU Health. Patients with insurance coverage should bring their insurance card and CNIC at the time of visit. Claims processing typically takes 3 to 5 working days.

# Emergency Cases:
# While we are not a full emergency hospital, we can provide first aid and stabilization for minor emergencies during clinic hours. For serious emergencies, we advise patients to go directly to the nearest hospital emergency room, such as Services Hospital or Shaukat Khanum, both within a 10-minute drive of our clinic.

# Location and Parking:
# Our clinic is located at 45-B Gulberg III, Lahore, near the Liberty Market roundabout. Free parking is available for up to 20 vehicles in our dedicated parking lot behind the building. Wheelchair access is available through the side entrance.

# Follow-up and Prescription Refills:
# Patients requiring prescription refills for chronic conditions such as diabetes or hypertension can request refills without an in-person visit if they have been seen within the last 3 months. Refill requests can be submitted through our website or by calling the clinic directly, and are typically processed within 2 hours during clinic operating hours.

# Cancellation Policy:
# Appointments can be cancelled or rescheduled up to 3 hours before the scheduled time without any penalty. Cancellations made less than 3 hours in advance, or no-shows, may incur a Rs 500 cancellation fee for specialist appointments."""

# chunks = chunk_text(clinic_text, chunk_size=500, overlap=50)
# print(f"Number of chunks: {len(chunks)}")
# for i, c in enumerate(chunks):
#     print(f"--- Chunk {i} ---")
#     print(c)
#     print()

# embeddings = embed_chunks(chunks)
# store_chunks(bot_id=bot_id, source_id="manual-test-source", chunks=chunks, embeddings=embeddings)

# # Step 3: re-test all questions
# questions = [
#     "What time do you open?",
#     "How much does a specialist consultation cost?",
#     "Do you accept insurance?",
#     "What's your return policy on shoes?",
# ]

# for q in questions:
#     results = retrieve_relevant_chunks(bot_id=bot_id, question=q, top_k=3)
#     print(f"\nQ: {q}")
#     for chunk, distance in results:
#         print(f"  Distance: {distance:.4f} | Chunk: {chunk[:80]}")
#     answer = generate_answer(
#         question=q,
#         retreived_chunks=results,
#         fallback_message="Sorry, I don't have that information. Please contact us directly."
#     )
#     print(f"A: {answer}")
#     print("---")

from bots.rag_utils import get_bot_collection

collection = get_bot_collection("3d223fb3-7c81-4c7e-91db-272bb9a6f78f")
print(collection.count())