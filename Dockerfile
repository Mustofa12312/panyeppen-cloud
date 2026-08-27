# Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Server
FROM node:20-alpine

WORKDIR /app

# Install native dependencies for SQLite if needed (alpine)
RUN apk add --no-cache sqlite-dev python3 make g++ 

COPY package*.json ./
# Install production dependencies only
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY db.js ./
COPY seed.js ./

# Create directories for persistent data
RUN mkdir -p /app/data /app/storage

# Setup environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV JWT_SECRET=change-this-in-production
ENV STORAGE_PATH=/app/storage

EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "start"]
