#!/bin/bash

# Add SSH key to the authentication agent
if [ -z "$SSH_AUTH_SOCK" ]; then
	eval "$(ssh-agent -s)"
fi
ssh-add -q ~/.ssh/id_ed25519

# Server details
SERVER_USER="root"
SERVER_HOST="45.79.216.185"
BACKUP_DIR="/home/srp/backups/portfolio"
MAX_BACKUPS=3

# Build the project locally
echo "Building the project locally..."
cd /home/srp/Code/astro/portfolio-v2
npm run build

# Backup the current website on the server
echo "Backing up the current website on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "\
    BACKUP_DIR='${BACKUP_DIR}' && \
    sudo mkdir -p \"\$BACKUP_DIR\" && \
    BACKUP_FILE=\"\$BACKUP_DIR/$(date +%Y%m%d_%H%M%S).tar.gz\" && \
    sudo tar -czf \"\$BACKUP_FILE\" -C /usr/share/nginx/html ."

# Remove old backups, keeping only the last MAX_BACKUPS
echo "Removing old backups, keeping only the last ${MAX_BACKUPS}..."
ssh "${SERVER_USER}@${SERVER_HOST}" "ls -1t ${BACKUP_DIR} | tail -n +$((${MAX_BACKUPS} + 1)) | xargs -I{} rm ${BACKUP_DIR}/{}"

# Remove the current website files on the server
echo "Removing the current website files on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo rm -rf /usr/share/nginx/html/*"

# Transfer the new dist to the server
echo "Transferring the new dist to the server..."
scp -r /home/srp/Code/astro/portfolio-v2/dist/* "${SERVER_USER}@${SERVER_HOST}:/usr/share/nginx/html"

echo "Deployment completed successfully!"
