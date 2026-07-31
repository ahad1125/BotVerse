#!/bin/sh

# Apply database migrations
python manage.py migrate --noinput

# Start Celery worker in the background
celery -A convera worker --loglevel=info --concurrency=1 &

# Start Django backend server
gunicorn convera.wsgi:application --bind 0.0.0.0:$PORT
