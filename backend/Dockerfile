FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn psycopg2-binary dj-database-url django-cloudinary-storage cloudinary

# Copy code
COPY . .

# Fix shell line endings in entrypoint for Linux compatibility
RUN sed -i 's/\r$//' entrypoint.sh
RUN chmod +x entrypoint.sh

# Run startup script
CMD ["./entrypoint.sh"]
