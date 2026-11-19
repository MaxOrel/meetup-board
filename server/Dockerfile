# Multi-stage: собираем TypeScript с dev-зависимостями, запускаем без них
# ---------- Сборка ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Запуск ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Сид: тысяча событий для пустой базы
COPY data ./data
# Не root: если в приложении найдут дыру, у процесса меньше прав
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
