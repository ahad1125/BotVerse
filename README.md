# BotVerse

BotVerse is an agentic chatbot builder platform that enables users to create, configure, train, and deploy customized AI chatbots. It supports both English and Urdu query handling using RAG (Retrieval-Augmented Generation) coupled with Gemini embeddings and LLMs. The platform includes a live chat widget that can be embedded on any third-party client site.

## Architecture

The project is split into two primary components:

1. **Frontend**: A React single-page application built with modern UI design principles, Tailwind CSS, Framer Motion, and TanStack Query.
2. **Backend**: A Django REST Framework application managing user authentication, bot configuration, database persistence, knowledge source parsing, and vector search.

## Features

- **Multi-tenant Bot Management**: Users can create multiple bots, configure names, custom avatars, primary colors, and greeting messages.
- **Multilingual RAG Engine**: Supports text extraction from raw URLs or uploaded documents, processes and chunks content, and generates vector representations using Gemini embeddings.
- **Embedded Chat Widget**: Provides an auto-loading script tag that dynamically injects a floating chat window into third-party HTML pages.
- **Analytics Dashboard**: Tracks user messages, session history, and clusters similar questions using agglomerative clustering.
- **Secure Authentication**: Includes registration, email verification using SMTP OTP codes, and JWT session handling.

## Technology Stack

- **Backend**: Python, Django, Django REST Framework, WhiteNoise, PostgreSQL with pgvector, Celery.
- **AI Integrations**: Google GenAI SDK (Gemini models).
- **Frontend**: React, Axios, React Query, React Router, Tailwind CSS, Framer Motion.

## Project Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` root directory and add the following variables:
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=5432
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_gmail_app_password
   RESEND_API_KEY=your_resend_api_key
   ```
5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/chatbot-builder-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend root and set the backend API URL:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Backend Deployment (Render)

- The backend is configured to build using the provided `Dockerfile`.
- Set the environment variable `RESEND_API_KEY` on Render to handle transactional OTP emails over HTTPS (bypassing Render's default outbound SMTP blocks).
- WhiteNoise is configured to serve static assets (such as the embedded widget script) automatically in production.

### Frontend Deployment (Vercel)

- Build and deploy the frontend directory directly on Vercel.
- Configure `VITE_API_URL` to point to the live Render backend URL.
