# Gunicorn configuration file
# This configuration increases timeout to support large file uploads (up to 500MB)

import multiprocessing

# Server socket
bind = "0.0.0.0:5000"

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"

# Timeout settings (5 minutes to allow large video uploads)
timeout = 300
keepalive = 5

# Enable hot reload for development
reload = True
reuse_port = True

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Worker limits
max_requests = 1000
max_requests_jitter = 50
