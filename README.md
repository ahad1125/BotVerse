# BotVerse

BotVerse is an agentic chatbot builder platform that empowers businesses to create, configure, train, and deploy customized AI chatbots. Supporting both English and Urdu query handling, the platform utilizes a advanced Retrieval-Augmented Generation (RAG) pipeline coupled with Gemini embeddings and LLMs to answer questions from a custom knowledge base. Additionally, BotVerse features a live, customizable chat widget that can be embedded on any third-party website, a lead generation capture engine, and rich semantic analytics.

---

## System Architecture

The following diagram illustrates the flow of data and interaction between the frontend, backend, database, celery workers, and external AI services:

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#3B82F6,stroke:#1D4ED8,stroke-width:2px,color:#fff;
    classDef backend fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef broker fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff;
    classDef worker fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff;
    classDef db fill:#EF4444,stroke:#B91C1C,stroke-width:2px,color:#fff;
    classDef ai fill:#EC4899,stroke:#BE185D,stroke-width:2px,color:#fff;
    classDef external fill:#6B7280,stroke:#374151,stroke-width:2px,color:#fff;

    %% Nodes
    Frontend[React Frontend: Vite]:::frontend
    Backend[Django REST Backend]:::backend
    Redis[(Redis Broker)]:::broker
    Celery[Celery Workers]:::worker
    Postgres[(PostgreSQL DB + pgvector)]:::db
    Gemini[Gemini API Client]:::ai
    Cloudinary[Cloudinary Cloud Storage]:::external
    Widget[Embeddable Widget JS]:::frontend

    %% Flow
    Frontend -- "API Requests (JWT / Chat / Analytics)" --> Backend
    Widget -- "Direct Chat API Requests" --> Backend
    
    %% Backend Actions
    Backend -- "1. Trigger Async Ingestion" --> Redis
    Backend -- "2. Extract Lead Info / Gen Answer" --> Gemini
    Backend -- "3. Query Vector Embeddings & Metadata" --> Postgres

    %% Redis & Celery Ingestion Actions
    Redis -- "Consume Tasks" --> Celery
    
    %% Celery Actions
    Celery -- "Fetch Document/Media Files" --> Cloudinary
    Celery -- "Generate Chunk Embeddings" --> Gemini
    Celery -- "Write Knowledge Chunks & Vectors" --> Postgres
```

---

## Detailed Component Directory Structure

### 1. Backend Service (`backend/`)
The backend is built with Django REST Framework and handles business logic, security, async job orchestration, and database storage.

*   **[`convera/`](file:///c:/Users/ahad/Documents/University/Convera/backend/convera)**: Base application configuration containing settings, base URL router patterns, WSGI/ASGI entrypoints, and Celery setup.
*   **[`users/`](file:///c:/Users/ahad/Documents/University/Convera/backend/users)**: Handles multi-tenant user authentication, session tokens, JWTs, and secure sign-up verification with OTP emails.
*   **[`bots/`](file:///c:/Users/ahad/Documents/University/Convera/backend/bots)**: Core bot configuration module.
    *   **[`models.py`](file:///c:/Users/ahad/Documents/University/Convera/backend/bots/models.py)**: Defines DB representations for Bots, Conversations, Messages, Leads, Quick Replies, Knowledge Sources, and Knowledge Chunks. Includes the `pgvector` Django field for storing embedding dimensions.
    *   **[`rag_utils.py`](file:///c:/Users/ahad/Documents/University/Convera/backend/bots/rag_utils.py)**: Core search, text chunking, and AI assistant interfaces. Scans and queries chunk embeddings using cosine distances via `pgvector.django.CosineDistance`, extracts leads semantically with LLMs, and performs agglomerative clustering of user questions.
    *   **[`tasks.py`](file:///c:/Users/ahad/Documents/University/Convera/backend/bots/tasks.py)**: Asynchronous task definitions. Reads, parses, and scrapes uploaded document types (PDF, Docx, CSV, plain text, web page URLs, and YouTube transcripts), chunks text, fetches embeddings via Gemini, and saves them to PostgreSQL.
    *   **[`views.py`](file:///c:/Users/ahad/Documents/University/Convera/backend/bots/views.py)**: Handles REST requests for bot creation, knowledge source ingestion, public widgets, messages, QR code generation, and chat endpoints.
*   **[`analytics/`](file:///c:/Users/ahad/Documents/University/Convera/backend/analytics)**: Serves reporting queries for the metrics dashboard. Contains helper functions to fetch total conversations, unanswered query hits, daily session volume trends, busy peak hours, and semantic clusters of user questions.
*   **[`widgets/`](file:///c:/Users/ahad/Documents/University/Convera/backend/widgets)**: Manages theme options, positions, and active configurations of the embeddable chat script.

### 2. Frontend Application (`frontend/`)
A responsive Single Page Application (SPA) designed to administer and configure the bots.

*   **[`chatbot-builder-frontend/src/pages/`](file:///c:/Users/ahad/Documents/University/Convera/frontend/chatbot-builder-frontend/src/pages)**:
    *   `Home.jsx`: Landing and marketing introduction page.
    *   `Login.jsx` & `Register.jsx`: Portal sign-in and account registration.
    *   `VerifyOTP.jsx`: One-Time-Password entry validator.
    *   `Dashboard.jsx`: Workspace overview displaying all created chatbots.
    *   `BotDetail.jsx`: Chatbot control room. Configures bot options (avatar, greeting, fallback language, theme colors, widget coordinates), links knowledge bases, and displays embed script snippets.
    *   `ChatPlayground.jsx`: Sandbox for chat testing.
    *   `Analytics.jsx`: Dashboard displaying graphs, lead data, answer rates, and top questions.
    *   `PublicChat.jsx`: Clean chat display for standalone link sharing.
*   **[`chatbot-builder-frontend/src/components/`](file:///c:/Users/ahad/Documents/University/Convera/frontend/chatbot-builder-frontend/src/components)**: Reusable components including the statistical card widgets (`DashboardStats.jsx`), lead viewer grids (`LeadsTable.jsx`), knowledge source ingestion inputs (`CreateKnowledgeSourceUpload.jsx`), and quick reply setups (`QuickRepliesManager.jsx`).

---

## Technology Stack

### Backend Technologies
*   **Django & Django REST Framework (DRF)**: High-level Python Web framework.
*   **PostgreSQL & pgvector**: Relational database with vector similarity search capabilities.
*   **Celery & Redis**: Task queue and broker for background asynchronous text scraping and embedding generation.
*   **Google GenAI SDK**: Interfaces with Gemini models (`gemini-3.1-flash-lite` for generation and `text-embedding-004` for vectors).
*   **BeautifulSoup4 & requests**: Scraping text from public web URLs.
*   **pypdf & python-docx**: Direct text extraction from files.
*   **youtube-transcript-api**: Fetches subtitle scripts from YouTube links.
*   **Cloudinary**: Media server storage for custom bot avatars and knowledge files.
*   **scikit-learn**: Agglomerative clustering of similar queries for advanced analytics.

### Frontend Technologies
*   **React & Vite**: Fast build tool and UI library.
*   **Tailwind CSS**: Modern utility-first CSS styling framework.
*   **Framer Motion**: Smooth micro-animations, transitions, and slide effects.
*   **TanStack Query (React Query)**: Caching and asynchronous state synchronizer.
*   **Recharts**: Data visualization charts for peak hour and volume statistics.

---

## Detailed Project Setup & Local Run Instructions

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL with the `pgvector` extension installed.
*   Redis server running locally.

---

### Step 1: Backend Service Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    # macOS/Linux:
    source .venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file**:
    Create a `.env` file in the `backend/` directory and configure the environment variables:
    ```env
    # Database Configuration
    DB_NAME=botverse_db
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_HOST=127.0.0.1
    DB_PORT=5432

    # API Keys & Third Party Configuration
    GEMINI_API_KEY=your_gemini_api_key
    CLOUDINARY_URL=cloudinary://your_key:your_secret@your_cloud_name
    FRONTEND_URL=http://localhost:5173

    # SMTP/OTP Configuration
    EMAIL_HOST_USER=your_email@gmail.com
    EMAIL_HOST_PASSWORD=your_gmail_app_password
    RESEND_API_KEY=your_resend_api_key
    ```

5.  **Apply migrations**:
    ```bash
    python manage.py migrate
    ```

6.  **Run the application servers**:
    *   **Django API Server**:
        ```bash
        python manage.py runserver
        ```
    *   **Celery Worker Task Processor** (Run in a separate terminal with virtual env activated):
        ```bash
        # Windows:
        celery -A convera worker --loglevel=info --pool=solo
        # macOS/Linux:
        celery -A convera worker --loglevel=info
        ```

---

### Step 2: Frontend Client Setup

1.  **Navigate to the React application folder**:
    ```bash
    cd frontend/chatbot-builder-frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file in the `frontend/chatbot-builder-frontend` directory:
    ```env
    VITE_API_URL=http://127.0.0.1:8000/api/v1
    ```

4.  **Start the Vite development web server**:
    ```bash
    npm run dev
    ```

5.  **Access the application**: Open your browser to `http://localhost:5173`.

---

## API Endpoints Reference Summary

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/users/register/` | POST | Anonymous | Registers a new user. |
| `/api/v1/users/verify-otp/` | POST | Anonymous | Verifies OTP sent via email to activate the user account. |
| `/api/v1/users/login/` | POST | Anonymous | Logins user and returns JWT token credentials. |
| `/api/v1/bots/` | GET/POST | JWT Token | Lists and creates chatbots belonging to the user. |
| `/api/v1/bots/<bot_id>/` | GET/PUT/DELETE | JWT Token | Fetch, modify, or delete a specific bot structure. |
| `/api/v1/bots/<bot_id>/knowledge-sources/` | GET/POST | JWT Token | Gets ingestion states and uploads files/URLs. |
| `/api/v1/bots/<bot_id>/knowledge-sources/<source_id>/retry/` | POST | JWT Token | Re-runs chunking and vector creation task for failed sources. |
| `/api/v1/bots/<bot_id>/chat/` | POST | Anonymous | Endpoint where user queries are processed and answered. |
| `/api/v1/bots/<bot_id>/leads/` | GET | JWT Token | Renders all captured leads. |
| `/api/v1/bots/<bot_id>/analytics/summary/` | GET | JWT Token | Fetch aggregate reports for the bot analytics dashboard. |
