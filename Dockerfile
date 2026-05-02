# Runtime DB_* (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME) must be supplied
# by docker-compose `environment` / `env_file` — see docker-compose.yml. Do not bake
# connection strings into the image.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4040

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4040

CMD ["node", "dist/main"]
