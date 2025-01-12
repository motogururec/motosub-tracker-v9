# Build stage
FROM node:20.11-slim AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:1.25.3-alpine-slim

# Install additional security packages and create non-root user
RUN apk add --no-cache \
    curl \
    tzdata \
    && addgroup -g 1001 appgroup \
    && adduser -u 1001 -G appgroup -g 'appuser' -s /bin/sh -D appuser

# Security headers and configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R appuser:appgroup /var/run/nginx.pid

# Configure nginx to run as non-root
RUN sed -i '/user  nginx;/d' /etc/nginx/nginx.conf && \
    sed -i 's,listen       80;,listen       8080;,' /etc/nginx/conf.d/default.conf && \
    sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf

# Switch to non-root user
USER appuser

# Expose port 8080 for non-root user
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/ || exit 1