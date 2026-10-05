# syntax=docker/dockerfile:1.7

# Bun 1.4.2 is the current stable Alpine image at the time of this update.
# Upgrade Alpine packages in every stage so the final image ships with the latest patched OS libraries.
FROM oven/bun:1.4.2-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM oven/bun:1.4.2-alpine AS builder
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_AUTH_MODE
ARG VITE_KEYCLOAK_ISSUER
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_KEYCLOAK_REDIRECT_URI
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SHEETS_WEBAPP_URL

ENV VITE_AUTH_MODE=$VITE_AUTH_MODE
ENV VITE_KEYCLOAK_ISSUER=$VITE_KEYCLOAK_ISSUER
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_REDIRECT_URI=$VITE_KEYCLOAK_REDIRECT_URI
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SHEETS_WEBAPP_URL=$VITE_SHEETS_WEBAPP_URL

RUN bun run build

# Nginx stable pinned to an explicit Nginx and Alpine version.
# Upgrade Alpine packages in the runtime stage too so the final image ships without known OS vulnerabilities.
FROM nginx:1.30.5-alpine3.24 AS runner
WORKDIR /usr/share/nginx/html
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
