# Pin a Node LTS that supports process.loadEnvFile (>= 20.12) and global fetch (>= 18).
FROM node:22-slim

WORKDIR /app

# Install deps first so this layer is cached unless package files change.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Don't run as root.
USER node

CMD ["node", "main.js"]