
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm install

COPY . .

# Build the application
RUN npm run build

# --- Étape de production (Production Stage) ---
FROM nginx:stable-alpine

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration (optional, but good practice for React routing)
# If you have specific routing needs (e.g., for react-router-dom history mode),
# create an nginx.conf in frontend-app/nginx/default.conf and uncomment this line:
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
