FROM node:20-alpine as build
WORKDIR /app
# Ensure the upload directory exists
RUN mkdir -p public/temp
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]