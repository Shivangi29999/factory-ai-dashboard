# Gunicorn configuration for FastAPI
# Use this if your deployment requires gunicorn

import multiprocessing

# Bind to the specified port
bind = "0.0.0.0:8000"

# Use uvicorn workers for ASGI support
worker_class = "uvicorn.workers.UvicornWorker"

# Number of workers (recommend: 2-4 x CPU cores)
workers = multiprocessing.cpu_count() * 2 + 1

#threads per worker
threads = 2

# Timeout
timeout = 120

# Keepalive
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
