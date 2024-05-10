---
created: 2024-05-07T00:00:00Z
title: Deploying a Static Application Using Docker, Linode VPS, and Nginx
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
excerpt: In this guide, we'll walk through the process of deploying a static application using Docker, Dockerfile, a Linode VPS, and Nginx. Whether you're hosting a personal website, a portfolio, or any other static content, this tutorial will help you set up a reliable infrastructure.
category: tutorials
draft: true
tags:
  - docker
  - linode
  - nginx
  - vps
---

# Add Something Here

## 1. Setting Up a Linode VPS

### Create a Linode Account

1. Visit the [Linode website](https://www.linode.com/) and create an account.
2. Choose a Linode VPS plan that meets your requirements.
3. Provide a hostname, select a region, and choose an image (Ubuntu 24.04 LTS is recommended).
4. Linode will provision and deploy your VPS.

### Generating an SSH Key

To generate an SSH key, run the following command on your local machine:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Follow the prompts to save the key in the default location or specify a custom location.

### Adding the Public Key to Linode

1. Log in to your Linode account.
2. Go to the "SSH Keys" section under "My Profile".
3. Click on "Add an SSH Key".
4. Copy the contents of the public key file (usually `~/.ssh/id_rsa.pub`) and paste it into the provided field.
5. Give your SSH key a label for identification.
6. Click "Add SSH Key".

### Connecting to the Linode Server via SSH

Now, you can connect to your Linode server using SSH. Open a terminal and run the following command:

```bash
ssh root@your_linode_ip
```

### Creating a Non-Root User

It's recommended to create a non-root user for better security. Run the following command to create a new user:

```bash
sudo adduser username
```

Follow the prompts to set a password and provide any additional information.

## 2. Pointing a Domain to the VPS

To make your static application accessible via a custom domain name, you need to configure DNS (Domain Name System) records to point to your Linode VPS. Here's how you can do it:

1. **Log in to your Domain Registrar's Control Panel**: Access the control panel provided by the company where you registered your domain name. This could be GoDaddy, Namecheap, Google Domains, or any other domain registrar you used to purchase your domain.

2. **Locate DNS Settings**: Look for the section in your registrar's dashboard that allows you to manage DNS settings. This might be labeled as "DNS Management", "DNS Settings", "Advanced DNS", or similar.

3. **Add an "A" Record**: You'll need to create an "A" (Address) record to point your domain to the IP address of your Linode VPS.
   - In the DNS settings, find the option to add a new record.
   - Choose "A" from the record type dropdown menu.
   - In the "Host" or "Name" field, enter the hostname or subdomain you want to use (e.g., "www" for www.yourdomain.com).
   - In the "Points to" or "Address" field, enter the IP address of your Linode VPS.
   - Save the changes.

4. **Add a "CNAME" Record (Optional)**: If you want to use subdomains like "blog.yourdomain.com" or "shop.yourdomain.com", you can create CNAME records to point to your main domain or other services.
   - Choose "CNAME" from the record type dropdown menu.
   - Enter the desired subdomain in the "Host" or "Name" field.
   - In the "Points to" or "Value" field, enter your main domain name (e.g., "yourdomain.com").
   - Save the changes.

5. **Wait for DNS Propagation**: DNS changes can take some time to propagate across the internet. This process typically takes a few hours, but it can sometimes take up to 48 hours for changes to fully take effect.

6. **Verify Domain Configuration**: After DNS propagation is complete, you can verify that your domain is correctly pointing to your Linode VPS by pinging the domain or accessing it via a web browser.

By following these steps, your custom domain will be properly configured to route traffic to your Linode VPS, allowing users to access your static application using your chosen domain name.

## 3. Installing Docker on the VPS

### Update the Package Manager

Run the following command to update the package manager:

```bash
sudo apt update
```

### Install Docker

Execute the following commands to install Docker. Bear with me, I know it's a lot of commands to install Docker but it's relatively painless and the commands are directly from the Docker Install Guide:

```bash
# Remove potentially conflicting packages
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
    sudo apt-get remove $pkg;
done

# Add Docker's official GPG key and repository
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify the installation by running:

```bash
sudo docker run hello-world
```

## 4. Installing Nginx on the VPS

### Install Nginx

Run the following command to install Nginx:

```bash
sudo apt-get install nginx
```

### Start Nginx

Start Nginx with:

```bash
sudo systemctl start nginx
```

## 5. Creating a Dockerfile and Docker NGINX Config

### Creating the Dockerfile

A Dockerfile defines the steps to build a Docker image. Below is an example Dockerfile tailored for a static application:

```Dockerfile
# Stage 1: Build stage
FROM node:lts AS build

# Set working directory
WORKDIR /your-app-dir

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage
FROM nginx:alpine AS runtime

# Copy custom NGINX configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application from the build stage to NGINX serving directory
COPY --from=build /your-app-dir/dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080
```

This Dockerfile sets up two stages: the build stage and the runtime stage. In the build stage, it installs dependencies, builds the application, and in the runtime stage, it configures NGINX and serves the built application.

### Creating the NGINX Config used by the Dockerfile

To accompany the Dockerfile, we need to create a custom NGINX configuration. Create a directory named `nginx` in your project repository, and within it, create a file named `nginx.conf` with the following content:

```bash
worker_processes  1;

events {
  worker_connections  1024;
}

http {
  server {
    listen 8080;
    server_name   _;

    root   /usr/share/nginx/html;
    index  index.html index.htm;

    include /etc/nginx/mime.types;

    gzip on;
    gzip_min_length 1000;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;

    error_page 404 /404.html;
    location = /404.html {
      root /usr/share/nginx/html;
      internal;
    }

    location / {
      try_files $uri $uri/index.html =404;
    }
  }
}
```

This NGINX configuration optimizes serving static files, sets up gzip compression, handles error pages, and defines how NGINX should serve the application.

By following these steps, you'll have a Dockerfile and NGINX configuration ready to build and serve your static application efficiently.

## 6. Building the Docker Image

Build the Docker image in the directory containing the Dockerfile:

```bash
docker build -t my-static-app .
```

## 7. Running the Docker Container

Run the Docker container:

```bash
docker run -d --name my-static-container -p 8080:8080 my-static-app
```

## 8. Configuring Nginx on the Linode VPS

Edit the Nginx configuration file (/etc/nginx/nginx.conf) and add server blocks for HTTP and HTTPS proxying. Set up SSL certificates for secure connections.

```bash
server {
  server_name srpainter.com

  location / {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  listen 443 ssl;
  ssl_certificate .../..../.../path
  ssl_certificate_key ../../..key/path
  include ../.../.../ssl-confi-path
  ssl_dhparam .../.../.../path
}

server {
  if ($host = srpainter.com) {
     return 301 https://$host$request_uri;
  }

  listen 80;
  server_name srpainter.com;
  return 40
```

## 9. Conclusion

You've successfully deployed your static application! It's now accessible via the domain pointing to your Linode VPS.

## Additional Notes:

- For more information on Docker, refer to the [Docker documentation](https://docs.docker.com/).
- For more information on Nginx, refer to the [Nginx documentation](https://nginx.org/en/docs/).
- For more information on Linode, refer to the [Linode documentation](https://www.linode.com/docs/).

## Upstream and Downstream Topics:

- [Docker Networking](https://docs.docker.com/network/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Linode VPS Management](https://www.linode.com/docs/getting-started/)
