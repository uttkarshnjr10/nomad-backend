# Stage 1: Build the static files
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Accept arguments defined in docker-compose
ARG VITE_AUTH_API_URL
ARG VITE_CONTENT_API_URL
ARG VITE_CHAT_SOCKET_URL

# Set them as ENV vars so Vite can see them during build
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_CONTENT_API_URL=$VITE_CONTENT_API_URL
ENV VITE_CHAT_SOCKET_URL=$VITE_CHAT_SOCKET_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]