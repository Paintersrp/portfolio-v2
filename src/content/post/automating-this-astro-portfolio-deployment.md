---
created: 2024-05-14T00:00:00Z
title: Automating this Astro Portfolio Deployment 2
image: https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80
excerpt: Discover how I transformed my portfolio updates from a manual chore to a streamlined, automated process.
category: tutorials
draft: false
tags:
  - deployment
  - automation
---

## Introduction

In this tutorial, I'll share how I automated the build and deployment process for my portfolio, which is built with Astro, the modern static site generator. This automation has streamlined my workflow, allowing me to focus more on development and less on the repetitive tasks of deployment.

## What is Astro?

Astro is a modern static site generator that I chose for its simplicity and performance. It allows me to use React, Vue, or Svelte components, but outputs static HTML for a fast-loading portfolio.

## The Deployment Process

Traditionally, deploying my Astro website involved:

1. **Building the project**: Executing `npm run build` to compile a production-ready build within the `dist` directory.
2. **Transferring files**: Employing tools like `scp` or `rsync` to migrate the `dist` contents to the server's document root.
3. **Verifying deployment**: Ensuring the live portfolio reflects the updates correctly.

This manual approach, while clear-cut, proved repetitive and susceptible to human error, prompting me to seek a more automated solution.

## Automating with Bash Scripts

To streamline the deployment process, I created two bash scripts: `deploy.sh` and `recover.sh`. These scripts handle tasks like building the project, creating backups, transferring files to the server, and restoring previous versions if needed.

### Deploy Script

The `deploy.sh` script automates the following tasks:

1. Builds the Astro project locally using `npm run build`.
2. Creates a backup of the current website files on the server.
3. Removes old backups, keeping only the last three for safety.
4. Removes the current website files from the server's document root.
5. Transfers the new `dist` files to the server's document root using `scp`.

Here's the contents of the `deploy.sh` script:

```bash
#!/bin/bash

# Add your SSH key to the agent
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)"
fi
ssh-add -q ~/.ssh/id_ed25519

SERVER_USER="srp"
SERVER_HOST="server_ip"
BACKUP_DIR="/home/srp/backups/portfolio"
MAX_BACKUPS=3

echo "Building the project locally..."
cd /path/to/your/astro/project
npm run build

echo "Backing up the current website on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "\
    BACKUP_DIR='${BACKUP_DIR}' && \
    sudo mkdir -p \"\$BACKUP_DIR\" && \
    BACKUP_FILE=\"\$BACKUP_DIR/$(date +%Y%m%d_%H%M%S).tar.gz\" && \
    sudo tar -czf \"\$BACKUP_FILE\" -C /path/to/server/document/root ."

echo "Removing old backups, keeping only the last ${MAX_BACKUPS}..."
ssh "${SERVER_USER}@${SERVER_HOST}" "ls -1t ${BACKUP_DIR} | tail -n +$((${MAX_BACKUPS} + 1)) | xargs -I{} rm ${BACKUP_DIR}/{}"

echo "Removing the current website files on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo rm -rf /path/to/server/document/root/*"

echo "Transferring the new dist to the server..."
scp -r /path/to/your/astro/project/dist/* "${SERVER_USER}@${SERVER_HOST}:/path/to/server/document/root"

echo "Deployment completed successfully!"
```

To run the script, simply execute `bash deploy.sh` in your terminal.

### Recovery Script

In case I need to revert to a previous version of this portfolio website, the `recover.sh` script allows me to restore a specific backup from the server.

```bash
#!/bin/bash

# Add your SSH key to the agent
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)"
fi
ssh-add -q ~/.ssh/id_ed25519

SERVER_USER="srp"
SERVER_HOST="server_ip"
BACKUP_DIR="/home/srp/backups/portfolio"

echo "Available backups on the server:"
ssh "${SERVER_USER}@${SERVER_HOST}" "ls -ltr ${BACKUP_DIR}"

read -p "Enter the backup file name (e.g., 20240510_123456.tar.gz): " BACKUP_FILE

if [ -z "$BACKUP_FILE" ]; then
    echo "No backup file specified. Exiting."
    exit 1
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

if ! ssh "${SERVER_USER}@${SERVER_HOST}" "[ -f \"${BACKUP_PATH}\" ]"; then
    echo "Backup file ${BACKUP_PATH} not found on the server. Exiting."
    exit 1
fi

echo "Removing the current website files on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo rm -rf /path/to/server/document/root/*"

echo "Extracting the backup ${BACKUP_FILE} on the server..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo tar -xzf \"${BACKUP_PATH}\" -C /path/to/server/document/root"

echo "Recovery completed successfully!"
```

To use the recovery script, I run `recover.sh` and follow the prompts to select the backup file I want to restore.

## Enhancing Further

While the current scripts have significantly improved the deployment process, there are always ways to enhance and refine:

1. **Integrating with CI/CD**: Setting up continuous integration and deployment pipelines to automate the process further.
2. **Monitoring**: Implementing monitoring tools to check the health and performance of the portfolio post-deployment.

## Conclusion

In conclusion, automating the deployment process of my Astro portfolio has been a game-changer. It has not only saved me time but also reduced the risk of human error that comes with manual deployment. The deploy.sh and recover.sh scripts have become essential tools in my development toolkit, ensuring that updates to my portfolio are seamless and stress-free.

As developers, we should always be looking for ways to optimize our workflows. Automation is a key step in that direction, and I hope this tutorial inspires you to explore automation in your projects. Remember, the goal is to make our lives easier and allow us to spend more time on creative endeavors rather than repetitive tasks.
