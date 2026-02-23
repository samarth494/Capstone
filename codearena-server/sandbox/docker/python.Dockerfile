# Dockerfile for Python Sandbox
FROM python:3.9-alpine

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN adduser -D sandboxuser
USER sandboxuser

# Command to run
CMD ["python", "solution.py"]
