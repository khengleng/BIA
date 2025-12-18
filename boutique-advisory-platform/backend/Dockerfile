FROM node:18-slim

# Install OpenSSL and other required dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Clear Prisma cache and generate client with correct binary targets
RUN rm -rf node_modules/.prisma && npx prisma generate

# Expose port
EXPOSE 4000

# Start the application in development mode
CMD ["npm", "run", "dev"]
