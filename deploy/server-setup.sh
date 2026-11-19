#!/usr/bin/env bash
# Подготовка чистого сервера Ubuntu (проверено на 24.04 и 26.04) под деплой. Запускается один раз, от root:
#   bash server-setup.sh "<публичный ключ deploy>"
# Ключ — содержимое файла deploy_key.pub, который вы создали на своём компьютере (ssh-keygen -t ed25519).
# Скрипт можно запускать повторно: уже сделанное он пропускает.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Запустите от root: sudo bash $0 ..."; exit 1; }
PUBKEY="${1:?Передайте публичный ключ строкой: bash server-setup.sh \"ssh-ed25519 AAAA... deploy\"}"

echo "==> Обновления системы"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
apt-get install -y ca-certificates curl ufw unattended-upgrades
# Security-обновления ставятся сами
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> Docker"
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh

echo "==> Сеть: у части провайдеров IPv6 выдан, но не работает — Docker тогда зависает на скачивании образов"
# Любой HTTP-ответ (здесь это 401) — значит, соединение по IPv6 есть
if [ "$(cat /proc/sys/net/ipv6/conf/all/disable_ipv6)" = 0 ] && ! curl -6 -sS -o /dev/null -m 10 https://ghcr.io/v2/ 2>/dev/null; then
  echo "    IPv6 до реестра GitHub не работает — отключаем, сайт работает по IPv4"
  printf "net.ipv6.conf.all.disable_ipv6 = 1\nnet.ipv6.conf.default.disable_ipv6 = 1\n" > /etc/sysctl.d/99-no-ipv6.conf
  sysctl --system >/dev/null
  systemctl restart docker
fi

echo "==> Пользователь deploy: входит только по ключу, работает только с Docker"
id deploy >/dev/null 2>&1 || adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
grep -qxF "$PUBKEY" /home/deploy/.ssh/authorized_keys 2>/dev/null || echo "$PUBKEY" >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
install -d -o deploy -g deploy /opt/meetup

echo "==> Файрвол: снаружи видно только SSH, HTTP и HTTPS"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo
echo "Готово. Дальше:"
echo " 1. С ВАШЕГО компьютера проверьте вход:  ssh -i deploy_key deploy@<адрес-сервера>"
echo " 2. Только после успешного входа отключите пароли для SSH (иначе рискуете запереть себя):"
echo "      sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && systemctl reload ssh"
echo " 3. Отпечаток сервера для секрета DEPLOY_KNOWN_HOSTS (выполнить на своём компьютере):"
echo "      ssh-keyscan -t ed25519 <адрес-сервера>"
