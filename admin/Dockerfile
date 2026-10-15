# Multi-stage build for admin
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# An explicit API origin is required for every image build.
# Avoid embedding an unintended environment-specific endpoint in static assets.
ARG VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL" || (echo 'Build arg VITE_API_BASE_URL is required' >&2; exit 1)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Cloud Run will set PORT environment variable automatically
# Default to 8080 if not set (Cloud Run standard)
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start nginx with environment variable substitution
# Cloud Run sets PORT automatically, so we use it
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
