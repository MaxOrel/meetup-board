#!/usr/bin/env bash
# Выкладка на сервере: ./deploy.sh <тег-образа>   или   ./deploy.sh rollback
# Запускается из папки /opt/meetup (рядом лежат compose.prod.yml и .env).
# Новая версия не поднялась и не стала «здоровой» за 2 минуты — возвращаем предыдущую.
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE=(docker compose -f compose.prod.yml)
STATE=.deploy-state   # две строки: CURRENT=<тег> и PREVIOUS=<тег>

[ -f .env ] || { echo "Нет файла .env — создайте его по образцу .env.example"; exit 1; }
CURRENT=""; PREVIOUS=""
[ -f "$STATE" ] && . "$STATE"

up() { # up <тег>: запустить версию и дождаться, пока все сервисы станут healthy
  IMAGE_TAG="$1" "${COMPOSE[@]}" up -d --remove-orphans --wait --wait-timeout 120
}

case "${1:-}" in
  "")
    echo "Использование: $0 <тег-образа> | rollback"; exit 1 ;;
  rollback)
    [ -n "$PREVIOUS" ] || { echo "Предыдущей версии нет — откатываться некуда"; exit 1; }
    echo "Откат: $CURRENT → $PREVIOUS"
    up "$PREVIOUS"
    printf 'CURRENT=%s\nPREVIOUS=%s\n' "$PREVIOUS" "$CURRENT" > "$STATE" ;;
  *)
    TAG="$1"
    echo "Выкладываем $TAG (сейчас работает: ${CURRENT:-ничего})"
    IMAGE_TAG="$TAG" "${COMPOSE[@]}" pull --quiet
    if up "$TAG"; then
      [ "$CURRENT" = "$TAG" ] && PREVIOUS_NEW="$PREVIOUS" || PREVIOUS_NEW="$CURRENT"
      printf 'CURRENT=%s\nPREVIOUS=%s\n' "$TAG" "$PREVIOUS_NEW" > "$STATE"
      docker image prune -f >/dev/null
      # Caddyfile подключён в контейнер файлом: новую версию Caddy увидит только после перезапуска
      if ! sha256sum -c --status .caddyfile.sha 2>/dev/null; then
        IMAGE_TAG="$TAG" "${COMPOSE[@]}" up -d --force-recreate --no-deps caddy
        sha256sum Caddyfile > .caddyfile.sha
      fi
      echo "Готово: работает $TAG"
    else
      echo "Версия $TAG не стала здоровой."
      IMAGE_TAG="$TAG" "${COMPOSE[@]}" logs --tail=40 api || true
      if [ -n "$CURRENT" ]; then
        echo "Возвращаем $CURRENT"
        up "$CURRENT" || true
      fi
      exit 1
    fi ;;
esac
. "$STATE"
IMAGE_TAG="$CURRENT" "${COMPOSE[@]}" ps
