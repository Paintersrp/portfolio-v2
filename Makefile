# Environment variables
SERVER_USER ?= root
SERVER_HOST ?= 45.79.216.185
BACKUP_DIR ?= /home/srp/backups/portfolio

.PHONY: build deploy backup clean recovery

build:
	@echo "Building the project locally..."
	npm run build

deploy: build backup
	@echo "Transferring the new dist to the server using rsync..."
	rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_HOST}:/usr/share/nginx/html
	@echo "Deployment completed successfully!"

backup:
	@echo "Backing up the current website on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} " \
		BACKUP_DIR='${BACKUP_DIR}' && \
		sudo mkdir -p \$$BACKUP_DIR && \
		BACKUP_FILE=\"\$$BACKUP_DIR/\$$(date +%Y%m%d_%H%M%S).tar.gz\" && \
		sudo tar -czf \$$BACKUP_FILE -C /usr/share/nginx/html . && \
		echo 'Cleaning up old backups...' && \
		cd \$$BACKUP_DIR && \
		ls -t | sed -e '1,3d' | xargs -d '\\n' sudo rm -f --"

clean:
	@echo "Removing the current website files on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} "sudo rm -rf /usr/share/nginx/html/*"

recovery:
	@echo "Available backups on the server:"
	@ssh ${SERVER_USER}@${SERVER_HOST} "ls -1t ${BACKUP_DIR}" | nl -v 1
	@echo "Please select the backup number you wish to recover:"
	@read -p "Backup number: " BACKUP_NUM; \
	BACKUP_FILE=$$(ssh ${SERVER_USER}@${SERVER_HOST} "ls -1t ${BACKUP_DIR}" | sed "$${BACKUP_NUM}q;d"); \
	if [ -z "$$BACKUP_FILE" ]; then \
		echo "Invalid selection. Exiting."; \
		exit 1; \
	fi; \
	if ssh ${SERVER_USER}@${SERVER_HOST} "[ -f \"${BACKUP_DIR}/$$BACKUP_FILE\" ]"; then \
		echo "Removing the current website files on the server..."; \
		ssh ${SERVER_USER}@${SERVER_HOST} "sudo rm -rf /usr/share/nginx/html/*"; \
		echo "Extracting the backup $$BACKUP_FILE on the server..."; \
		ssh ${SERVER_USER}@${SERVER_HOST} "sudo tar -xzf \"${BACKUP_DIR}/$$BACKUP_FILE\" -C /usr/share/nginx/html"; \
		echo "Recovery completed successfully!"; \
	else \
		echo "Backup file $$BACKUP_FILE not found on the server. Exiting."; \
	fi
