# ===================================================================
# STAGE 1: Install Dependencies
# ===================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ===================================================================
# STAGE 2: Build Production Bundle Vite
# ===================================================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build frontend production bundle
RUN npm run build

# ===================================================================
# STAGE 3: Production Runner dengan Nginx Alpine
# ===================================================================
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Bersihkan default html
RUN rm -rf ./*

# Copy hasil build dari Stage 2
COPY --from=builder /app/dist ./

# Copy konfigurasi Nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
