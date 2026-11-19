# Сервер

Выкладку делает CI: после зелёных проверок в `main` задача `deploy` копирует сюда `compose.prod.yml`, `Caddyfile` и `deploy.sh` и запускает `./deploy.sh <хеш коммита>`. Руками на сервере остаётся только `.env`.

## Подготовка чистой Ubuntu (один раз)

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-deploy" -N ""      # на своём компьютере
scp deploy/server-setup.sh root@<IP>:
ssh root@<IP> "bash server-setup.sh \"$(cat deploy_key.pub)\""
```

Скрипт ставит Docker, создаёт пользователя `deploy` (вход только по ключу), открывает в файрволе порты 22, 80 и 443 и готовит `/opt/meetup`.

## `.env` на сервере

```bash
ssh -i deploy_key deploy@<IP>
cd /opt/meetup && cp /dev/null .env && chmod 600 .env
```

Поля — в `.env.example`. Пароль базы и секрет токенов: `openssl rand -hex 32`. Файл `.env` в git не попадает.

## Секреты GitHub

Settings → Environments → `production`. Secrets and variables → Actions:

| Имя | Тип | Значение |
|---|---|---|
| `SITE_ADDRESS` | variable | домен сайта (тот же, что в `.env`) |
| `DEPLOY_HOST` | secret | IP сервера |
| `DEPLOY_USER` | secret | `deploy` |
| `DEPLOY_SSH_KEY` | secret | закрытый ключ `deploy_key` целиком |
| `DEPLOY_KNOWN_HOSTS` | secret | вывод `ssh-keyscan -t ed25519 <IP>` |

## Откат

```bash
ssh deploy@<IP> "cd /opt/meetup && ./deploy.sh rollback"
```

Версия в `https://<домен>/api/v1/health` сменится на предыдущую.
