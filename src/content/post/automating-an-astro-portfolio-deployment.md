---
created: 2024-05-14T00:00:00Z
title: Automating an Astro Portfolio Deployment
image: https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80
excerpt: Learn how to leverage Makefile and Git hooks to transform your deployment process into a streamlined, error-free operation, allowing you to deploy with confidence and ease.
category: tutorials
draft: false
tags:
  - deployment
  - automation
---

## Contents

1. [Introduction](#introduction)
2. [The Traditional Astro Deployment Workflow](#the-traditional-astro-deployment-workflow)
3. [Automating with Makefile and Git Hooks](#automating-with-makefile-and-git-hooks)
   - [Setting Up a Makefile](#setting-up-a-makefile)
   - [Setting Up the Git Pre-Push Hook](#setting-up-the-git-pre-push-hook)
4. [Enhancing the Automation Process](#enhancing-the-automation-process)
5. [Conclusion](#conclusion)

## Introduction

In this tutorial, I'll share how I automated the build and deployment process for my portfolio, which is built with Astro. This automation has streamlined my workflow, allowing me to focus more on development and less on the repetitive tasks of deployment.

## The Traditional Astro Deployment Workflow

Before diving into automation, let's revisit the traditional deployment process for an Astro website:

1. **Building the Project**: Running `npm run build` to generate a production-ready build in the `dist` directory.
2. **Transferring Files**: Using tools like `scp` or `rsync` to copy the `dist` contents to the server's document root.
3. **Verifying Deployment**: Ensuring the live portfolio reflects the latest updates correctly.

While straightforward, this manual approach can be time-consuming, repetitive, and prone to human error, motivating the need for an automated solution.

## Automating with Makefile and Git Hooks

To streamline the deployment process, we'll leverage two powerful tools: Makefile and Git hooks. Makefile provides a convenient way to define and execute a series of tasks, while Git hooks allow us to automate actions based on specific Git events, such as pushing changes to a remote repository.

### Setting Up a Makefile

Here's an example of how to set up a Makefile to automate your deployment process:

1. **Create the Makefile**: In the root directory of your project, create a file named `Makefile`.
2. **Add the automation script**: Create your targets in this new Makefile. Below is an example of the Makefile used for this Astro Portfolio.

```makefile
# Environment variables
SERVER_USER ?= root
SERVER_HOST ?= server_ip
BACKUP_DIR ?= /path/to/backups

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
	ssh ${SERVER_USER}@${SERVER_HOST} "\
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
```

### Setting Up the Git Pre-Push Hook

To fully automate the deployment process, we'll set up a Git pre-push hook that runs the `make deploy` command before any `git push` operation. This ensures that our changes are deployed before being pushed to the remote repository.

1. **Navigate to the hooks directory**: Go to the `.git/hooks` directory within your local repository.
2. **Create the pre-push script**: If it doesn't already exist, create a file named `pre-push` in the hooks directory.
3. **Make the script executable**: Run the command `chmod +x pre-push` to make the script executable.
4. **Add the hook script**: Add your pre-push content in this file. Below is an example of the pre-push script which runs the make deploy for this Astro Portfolio.

```bash
#!/bin/bash

# Run make deploy before pushing
make deploy

# If make deploy fails, exit with non-zero status to abort the push
if [ $? -ne 0 ]; then
  exit 1
fi
```

This script runs the `make deploy` command, and if it fails, it exits with a non-zero status, aborting the `git push` operation. This way, you can ensure that your changes are successfully deployed before they're pushed to the remote repository.

## Breaking Down the Makefile

#### Environment Variables
```makefile
SERVER_USER ?= root
SERVER_HOST ?= server_ip
BACKUP_DIR ?= /path/to/backups
```
These lines establish default values for the server's user, host, and backup directory. They act as placeholders that can be overridden with custom values when invoking the make command.

#### Build Target
```makefile
build:
	@echo "Building the project locally..."
	npm run build
```
The `build` target is responsible for compiling the project's source code into a set of static files. It uses the Node package manager (npm) to execute the build script defined in the project's `package.json` file.

#### Deploy Target
```makefile
deploy: build backup
	@echo "Transferring the new dist to the server using rsync..."
	rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_HOST}:/usr/share/nginx/html
	@echo "Deployment completed successfully!"
```
The `deploy` target orchestrates the deployment process. It ensures that the project is built, backed up, and the previous version is cleaned up before securely copying the new distribution files to the server using `rsync`. Using `rsync` for deploying files to a server can be a better option compared to `scp` in many cases. Here's why:

- **Incremental Updates**: `rsync` only transfers the changed parts of files, making it faster for incremental updates after the initial deployment.
- **Bandwidth Efficiency**: It uses compression and decompression during the transfer, saving bandwidth.
- **Error Checking**: `rsync` performs error checking after files have been copied, ensuring data integrity.
- **Preservation of File Attributes**: It can preserve timestamps, permissions, and other file attributes during the transfer.
- **Flexibility**: `rsync` has many options that can be tailored to various backup and synchronization tasks.

#### Backup Target
```makefile
backup:
	@echo "Backing up the current website on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} "\
		BACKUP_DIR='${BACKUP_DIR}' && \
		sudo mkdir -p \$$BACKUP_DIR && \
		BACKUP_FILE=\"\$$BACKUP_DIR/\$$(date +%Y%m%d_%H%M%S).tar.gz\" && \
		sudo tar -czf \$$BACKUP_FILE -C /usr/share/nginx/html . && \
		echo 'Cleaning up old backups...' && \
		cd \$$BACKUP_DIR && \
		ls -t | sed -e '1,3d' | xargs -d '\\n' sudo rm -f --"
```
The `backup` target secures the current live website by creating a compressed archive with a timestamp. It also includes a cleanup process to remove older backups, keeping the most recent three.

#### Clean Target
```makefile
clean:
	@echo "Removing the current website files on the server..."
	ssh ${SERVER_USER}@${SERVER_HOST} "sudo rm -rf /usr/share/nginx/html/*"
```
The `clean` target is designed to clear out the existing files in the server's web directory. This is a preparatory step to ensure that the new deployment does not mix with old files.

#### Recovery Target
```makefile
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
```
The `recovery` target provides a mechanism to restore the website from a specified backup. It lists available backups, prompts for a backup file selection, and proceeds with the restoration process if the file exists.

## Enhancing the Automation Process

While the Makefile and Git hook approach significantly streamlines the deployment process, there are additional enhancements you can consider:

1. **Continuous Integration and Deployment (CI/CD)**: Integrate your project with a CI/CD pipeline to automate the build, testing, and deployment processes even further. Tools like GitHub Actions, Travis CI, or CircleCI can be leveraged for this purpose.

2. **Monitoring and Notifications**: Implement monitoring tools to track the health and performance of your portfolio after deployment. Consider setting up notifications (e.g., email, Slack) to alert you of any issues or failures during the deployment process.

3. **Environment-Specific Configurations**: If you have multiple deployment environments (e.g., staging, production), consider extending the Makefile to handle environment-specific configurations and deployment targets.

4. **Deployment Rollbacks**: Enhance the `recovery` target to support rolling back to a previous deployment in case of issues with the latest deployment.

5. **Automated Testing**: Incorporate automated testing into your workflow to ensure that your portfolio functions as expected before and after deployments.

By continuously refining and enhancing your automation process, you can further streamline your workflow, reduce manual effort, and ensure a reliable and efficient deployment experience.

## Conclusion

Automating the deployment process of my Astro portfolio with a Makefile and Git hook has been incredibly efficient. It ensures that my portfolio is always up-to-date with the latest changes in my repository, with minimal manual intervention. This level of automation allows me to focus more on development and creativity, rather than the mechanics of deployment.

As developers, we should always be looking for ways to optimize our workflows. Automation is a key step in that direction, and I hope this tutorial inspires you to explore automation in your projects. Remember, the goal is to make our lives easier and allow us to spend more time on creative endeavors rather than repetitive tasks.
