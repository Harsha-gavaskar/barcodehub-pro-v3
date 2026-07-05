# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Copy lock files and packages
COPY package.json package-lock.json /app/

# Install dependencies
RUN npm ci

# Copy code and build
COPY . /app/
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config if needed, or default
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
