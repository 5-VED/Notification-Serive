# Development Dockerfile with hot reloading support
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose ports
EXPOSE 3001

# Set environment to development
ENV NODE_ENV=development

# Start with nodemon for hot reloading
CMD ["npm", "run", "start:dev"]
