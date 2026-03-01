# WSGI entry point for gunicorn
# This file allows gunicorn to serve the FastAPI application

from main import app

# For gunicorn to find the app
# Command: gunicorn wsgi:app
# Or: gunicorn -c gunicorn.conf.py wsgi:app
