# Multi-stage: первый этап собирает статику, второй только раздаёт её.
# В итоговом образе нет ни Node, ни исходников, ни node_modules — только nginx и dist.

# ---------- Сборка ----------
FROM node:24-alpine AS build
WORKDIR /app
# Сначала только package*.json: пока зависимости не менялись, Docker берёт npm ci из кеша
COPY package*.json ./
# Cypress для сборки не нужен — не качаем его браузерный движок
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci
COPY . .
# Фронт и API живут на одном адресе: nginx проксирует /api. Поэтому адрес API относительный.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Раздача ----------
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
