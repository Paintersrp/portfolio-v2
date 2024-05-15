# Environment variables
SERVER_USER ?= root
SERVER_HOST ?= 45.79.216.185
BACKUP_DIR ?= /home/srp/backups/portfolio

.PHONY: build deploy backup clean recovery

build:
	npm run build

deploy: build backup clean
	@echo "Transferring the new dist to the server..."
	scp -r dist/* ${SERVER_USER}@${SERVER_HOST}:/usr/share/nginx/html
	@echo "Deployment completed successfully!"

backup:
	@echo "Backing up the current website on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} " \
		BACKUP_DIR='${BACKUP_DIR}' && \
		sudo mkdir -p \"$BACKUP_DIR\" && \
		BACKUP_FILE=\"$$BACKUP_DIR/$$(date +%Y%m%d_%H%M%S).tar.gz\" && \
		sudo tar -czf \"$BACKUP_FILE\" -C /usr/share/nginx/html ."

clean:
	@echo "Removing the current website files on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} "sudo rm -rf /usr/share/nginx/html/*"

recovery:
	@echo "Available backups on the server:"
	ssh ${SERVER_USER}@${SERVER_HOST} "ls -ltr ${BACKUP_DIR}"
	@read -p "Enter the backup file name (e.g., 20240510_123456.tar.gz): " BACKUP_FILE; \
	if ssh ${SERVER_USER}@${SERVER_HOST} "[ -f \"${BACKUP_DIR}/$$BACKUP_FILE\" ]"; then \
		echo "Removing the current website files on the server..."; \
		ssh ${SERVER_USER}@${SERVER_HOST} "sudo rm -rf /usr/share/nginx/html/*"; \
		echo "Extracting the backup $$BACKUP_FILE on the server..."; \
		ssh ${SERVER_USER}@${SERVER_HOST} "sudo tar -xzf \"${BACKUP_DIR}/$$BACKUP_FILE\" -C /usr/share/nginx/html"; \
		echo "Recovery completed successfully!"; \
	else \
		echo "Backup file ${BACKUP_DIR}/$$BACKUP_FILE not found on the server. Exiting."; \
	fi
