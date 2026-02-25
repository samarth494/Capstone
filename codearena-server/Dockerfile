# ─────────────────────────────────────────────────────────────────────────────
# CodeArena Server — Production Dockerfile
# ─────────────────────────────────────────────────────────────────────────────
# This container needs access to the Docker daemon (socket mount) so the
# sandbox runners can "docker run" per-language containers for code execution.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:18-alpine

# Install Docker CLI (to run sandbox containers via host daemon)
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Create temp directories for sandbox execution
RUN mkdir -p sandbox/temp temp temp_code

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start the server
CMD ["node", "server.js"]
