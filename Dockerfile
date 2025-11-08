# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY .env.production .env

EXPOSE 3000

CMD ["npm", "run", "start"]
