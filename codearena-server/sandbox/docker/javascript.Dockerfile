# Dockerfile for Node.js Sandbox
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN adduser -D sandboxuser
USER sandboxuser

# Command to run (will be overridden)
CMD ["node", "solution.js"]
