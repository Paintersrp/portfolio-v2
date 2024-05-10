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

# List available backups on the server
echo "Available backups on the server:"
ssh "${SERVER_USER}@${SERVER_HOST}" "ls -ltr ${BACKUP_DIR}"

read -p "Enter the backup file name (e.g., 20240510_123456.tar.gz): " BACKUP_FILE

# Check if a backup file was specified
if [ -z "$BACKUP_FILE" ]; then
	echo "No backup file specified. Exiting."
	exit 1
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Check if the specified backup file exists on the server
if ! ssh "${SERVER_USER}@${SERVER_HOST}" "[ -f \"${BACKUP_PATH}\" ]"; then
	echo "Backup file ${BACKUP_PATH} not found on the server. Exiting."
	exit 1
fi

# Remove the current website files on the server
echo "Removing the current website files on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo rm -rf /usr/share/nginx/html/*"

# Extract the backup on the server
echo "Extracting the backup ${BACKUP_FILE} on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo tar -xzf \"${BACKUP_PATH}\" -C /usr/share/nginx/html"

echo "Recovery completed successfully!"
