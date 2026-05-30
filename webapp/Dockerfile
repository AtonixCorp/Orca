# ============================================================================
# File: webapp/Dockerfile
# Purpose:
#   Two-stage build: compile the React app with Vite, then serve the static
#   bundle from a tiny nginx image. Suitable for behind-a-reverse-proxy
#   deployments where TLS is terminated upstream.
# ============================================================================

# ---- Stage 1: build --------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build
# Trivy DS-0002: explicitly declare a non-root user in the Dockerfile.
USER node

# ---- Stage 2: serve --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY README.md /usr/share/nginx/html/README.md
USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:8080/ || exit 1
