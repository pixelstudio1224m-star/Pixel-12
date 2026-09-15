# Multi-stage production build for Pixel 12 OS (Render Free / Container)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Compile frontend (Vite) and backend (esbuild bundle in dist/server.cjs)
ENV NODE_ENV=production
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled production artifacts and base data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/firebase-applet-config.json* ./

# Render injects PORT dynamically (defaults to 3000)
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
