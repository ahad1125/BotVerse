#!/bin/sh

# Apply database migrations
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Start Celery worker in the background only if explicitly requested (e.g. if you upgrade RAM)
if [ "$START_CELERY_WORKER" = "True" ]; then
    celery -A convera worker --loglevel=info --concurrency=1 &
fi

# Start Django backend server
gunicorn convera.wsgi:application --bind 0.0.0.0:$PORT
