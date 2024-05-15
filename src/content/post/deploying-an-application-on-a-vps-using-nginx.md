---
created: 2024-05-07T00:00:00Z
title: Deploying an Application on a VPS using Nginx
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
excerpt: Learn how to deploy your application on a powerful Virtual Private Server (VPS) using the battle-tested Nginx web server. From setting up a secure VPS to configuring Nginx and automating deployments, this tutorial covers everything you need for a seamless, robust hosting experience.
category: tutorials
draft: false
tags:
  - linode
  - nginx
  - vps
---
## Contents

1. [Introduction](#1-introduction)
   - [What You'll Learn](#11-what-youll-learn)
2. [Prerequisites](#2-prerequisites)
3. [Setting Up a Secure VPS](#3-setting-up-a-secure-vps)
   - [Create a VPS Account](#31-create-a-vps-account)
   - [Generate an SSH Key](#32-generate-an-ssh-key)
   - [Add the Public Key to Your VPS](#33-add-the-public-key-to-your-vps)
   - [Connect to the VPS via SSH](#34-connect-to-the-vps-via-ssh)
   - [Create a Non-Root User (Recommended)](#35-create-a-non-root-user-recommended)
4. [Pointing a Domain to the VPS (Optional)](#4-pointing-a-domain-to-the-vps-optional)
   - [Log in to Your Domain Registrar's Control Panel](#41-log-in-to-your-domain-registrars-control-panel)
   - [Locate DNS Settings](#42-locate-dns-settings)
   - [Add an "A" / "AAAA" Record](#43-add-an-a--aaaa-record)
   - [Wait for DNS Propagation](#44-wait-for-dns-propagation)
   - [Verify Domain Configuration](#45-verify-domain-configuration)
5. [Installing Nginx on the VPS](#5-installing-nginx-on-the-vps)
   - [Update Package Lists and Install Nginx](#51-update-package-lists-and-install-nginx)
   - [Start the Nginx Service](#52-start-the-nginx-service)
6. [Configuring Nginx on Your VPS](#6-configuring-nginx-on-your-vps)
   - [Edit the Nginx Configuration File](#61-edit-the-nginx-configuration-file)
   - [Create a Server Block for Your Application](#62-create-a-server-block-for-your-application)
   - [Enable the Server Block](#63-enable-the-server-block)
   - [Test and Reload Nginx](#64-test-and-reload-nginx)
   - [Set Up SSL with Certbot (Optional)](#65-set-up-ssl-with-certbot-optional)
7. [Setting up a Basic Deployment](#7-setting-up-a-basic-deployment)
   - [Transfer Your Application Files](#71-transfer-your-application-files)
   - [Configure Nginx to Serve Your Application](#72-configure-nginx-to-serve-your-application)
   - [Verify the Deployment](#73-verify-the-deployment)
8. [Troubleshooting](#8-troubleshooting)
   - [Permission Denied Errors](#81-permission-denied-errors)
   - [SSH Connection Issues](#82-ssh-connection-issues)
   - [Nginx Configuration Errors](#83-nginx-configuration-errors)
9. [Conclusion](#9-conclusion)
10. [Additional Resources](#10-additional-resources)

### 1. Introduction

For any web-based project, deploying your web application securely and efficiently is crucial for delivering a smooth user experience. This guide will walk you through the process of setting up a Virtual Private Server (VPS) and leveraging the Nginx web server to host your application.

Whether you're launching a personal website, portfolio, or complex web application, this tutorial will equip you with the knowledge and skills to hit the ground running.

#### 1.1 What You'll Learn

By the end of this tutorial, you'll be able to:

- Set up a secure VPS with a provider like Linode, DigitalOcean, or AWS
- Generate and manage SSH keys for secure remote access
- Configure DNS records to point your domain to the VPS (if applicable)
- Install and configure Nginx
- Deploy your application on the VPS using Nginx
- Troubleshoot common issues and learn about additional resources

### 2. Prerequisites

Before we begin, ensure you have the following prerequisites in place:

- Basic knowledge of Linux and command-line interfaces
- Application files you'd like to serve
- (Optional) A domain name registered with a domain registrar

If you don't have a domain name yet, don't worry. We'll cover the steps for setting up a VPS without a domain, and you can always add a custom domain later. Throughout this process you can either use your domain if you set it up or your VPS IP if you don't have one.

### 3. Setting Up a Secure VPS

The first step is to create a secure VPS with a provider. A VPS offers you a dedicated and isolated environment to host your application, providing greater control, security, and flexibility compared to shared hosting options.

#### 3.1 Create a VPS Account

1. Visit the website of your chosen VPS provider and create an account.
2. Select a VPS plan that meets your requirements in terms of RAM, CPU, storage, and bandwidth. Start with the smallest. You can always upgrade later.
3. Provide a hostname (e.g., `example.com`), select a region closest to your target audience, and choose an operating system image (Ubuntu LTS is a popular choice).
4. Your VPS provider will provision and deploy your VPS within minutes.

#### 3.2 Generate an SSH Key

To securely connect to your VPS, you'll need to generate an SSH key on your local machine. SSH keys provide a more secure way to authenticate than using passwords, reducing the risk of unauthorized access.

Run the following command to generate an SSH key:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Follow the prompts to save the key in the default location (recommended) or specify a custom location.

#### 3.3 Add the Public Key to Your VPS

1. Log in to your VPS provider's control panel.
2. Navigate to the "SSH Keys" section.
3. Click on "Add an SSH Key".
4. Copy the contents of the public key file (usually `~/.ssh/id_rsa.pub`) and paste it into the provided field.
5. Give your SSH key a label for identification.
6. Click "Add SSH Key".

#### 3.4 Connect to the VPS via SSH

With your SSH key added, you can now securely connect to your VPS using SSH. Open a terminal and run the following command:

```bash
ssh root@your_vps_ip
```

Replace `your_vps_ip` with the IP address of your VPS.

#### 3.5 Create a Non-Root User (Recommended)

While you can perform server tasks as the root user, it's a best practice to create a non-root user for regular server operations. This approach improves security by limiting potential damage caused by accidental mistakes or vulnerabilities.

Run the following command to create a new user:

```bash
sudo adduser username
```

Follow the prompts to set a password and provide any additional information.

By following these steps, you've successfully set up a secure VPS environment, ready to host your application.

### 4. Pointing a Domain to the VPS (Optional)

If you have a domain name, you'll need to configure DNS (Domain Name System) records to point your domain to your VPS. This step is optional if you don't have a domain name yet, as you can still access your application using the VPS's IP address.

#### 4.1 Log in to Your Domain Registrar's Control Panel

Access the control panel provided by the company where you registered your domain name (e.g., GoDaddy, Namecheap, Google Domains).

#### 4.2 Locate DNS Settings

Look for the section that allows you to manage DNS settings. This might be labeled as "DNS Management", "DNS Settings", "Advanced DNS", or similar.

#### 4.3 Add an "A" / "AAAA" Record

Create an "A" (Address) record to point your domain to the IP address of your VPS.

- Find the option to add a new record.
- Choose "A" from the record type dropdown menu.
- In the "Host" or "Name" field, enter the hostname or subdomain you want to use (e.g., "www" for `www.yourdomain.com`).
- In the "Points to" or "Address" field, enter the IP address of your VPS.
- Save the changes.

#### 4.4 Wait for DNS Propagation

DNS changes can take some time to propagate across the internet. This process can anywhere from a few minutes to a few hours, but it can sometimes take up to 48 hours for changes to fully take effect. Your mileage may vary greatly here, but mine took about 15 minutes to propagate while setting up a VPS for this tutorial.

#### 4.5 Verify Domain Configuration

After DNS propagation is complete, you can verify that your domain is correctly pointing to your VPS by pinging the domain or accessing it via a web browser.

### 5. Installing Nginx on the VPS

Nginx is a powerful and lightweight web server that excels at serving static content and can handle high traffic loads with ease. In this section, we'll install and start Nginx on your VPS.

#### 5.1 Update Package Lists and Install Nginx

Run the following commands to update the package lists and install Nginx on Ubuntu:

```bash
sudo apt-get update
sudo apt-get install nginx
```

For other linux distributions, consult the [Nginx documentation](https://nginx.org/en/docs/install.html) for the appropriate installation command.

#### 5.2 Start the Nginx Service

Once Nginx is installed, start the service with:

```bash
sudo systemctl start nginx
```

You should now be able to access the default Nginx welcome page by visiting your VPS's IP address or domain in a web browser.

### 6. Configuring Nginx on Your VPS

After installing Nginx, the next step is to configure it to serve your application. Here's a general configuration guide that applies regardless of your VPS provider.

#### 6.1 Edit the Nginx Configuration File

Open the main Nginx configuration file with a text editor:

```bash
sudo nvim /etc/nginx/nginx.conf
```

This file controls the global settings of your Nginx server. Below is a basic configuration that sets up Nginx to serve static files and proxy requests to an application running on the same server:

```bash
user www-data;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

worker_processes 1;

events {
  worker_connections 1024;
}

http {
  server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html index.htm;

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

  include /etc/nginx/sites-enabled/*;
}
```

This configuration sets up an HTTP server block listening on port 8080 and serving static files from the `/usr/share/nginx/html` directory. It also includes settings for gzip compression, mime types, and error handling.

You can customize this configuration based on your specific requirements, such as enabling HTTPS, setting up redirects, or adding additional server blocks for multiple applications or domains.

#### 6.2 Create a Server Block for Your Application

Server blocks allow you to run multiple websites on a single server. Create a new server block file for your application:

```bash
sudo nano /etc/nginx/sites-available/myapp
```

Paste the following configuration, replacing `DOMAIN-HERE.com` with your actual domain or IP address:

```bash
server {
  server_name DOMAIN-HERE.com

  location / {
    proxy-pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  listen 443 ssl;
}

server {
  if ($host = DOMAIN-HERE.com) {
    return 301 https://$host$request_uri;
  }

      listen 80;
      server_name DOMAIN-HERE.com;
  return 404;
}
```

This configuration sets up a server block that proxies requests to an application running on `localhost:8080`. It also includes a redirect from HTTP to HTTPS (which will be enabled later after setting up SSL).

If you want to serve a specific application like React, you might include a location block like this:

```bash
# Proxy pass to application server (e.g., Node.js, Python)
location /app {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Replace `/app` with the appropriate path for your application.

#### 6.3 Enable the Server Block

Create a symbolic link to enable the new server block:

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
```

#### 6.4 Test and Reload Nginx

Test the configuration for syntax errors:

```bash
sudo nginx -t
```

If no errors are reported, reload Nginx to apply the changes:

```bash
sudo systemctl reload nginx
```

#### 6.5 Set Up SSL with Certbot (Optional)

To secure your site with HTTPS, use Certbot to obtain and renew Let's Encrypt SSL certificates:

1. Install Certbot and its Nginx plugin:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Run Certbot:

```bash
sudo certbot --nginx
```

3. Follow the prompts to configure SSL for your domain.

Certbot will modify your server block to include the necessary SSL configuration.

With Nginx properly configured, you're now ready to deploy your application on the VPS.

### 7. Setting up a Basic Deployment

To deploy your application, you'll need to place your application files in the correct directory and ensure Nginx is configured to serve them. Based on the Nginx configuration provided, here's how you can do it:

#### 7.1 Transfer Your Application Files

Use SCP to securely transfer files from your local machine to your VPS. Replace `your_user` with your non-root username, `your_vps_ip` with your VPS's IP address, and `/path/to/your/application` with the path to your application files.

```bash
scp -r /path/to/your/application your_user@your_vps_ip:/usr/share/nginx/html
```

#### 7.2 Configure Nginx to Serve Your Application

1. **Nginx Configuration**: Ensure that your server block is correctly pointing to the directory where you've placed your application files. In this case, it should be `/usr/share/nginx/html`.

2. **Test Configuration**: Always test your Nginx configuration for errors after making changes.

```bash
sudo nginx -t
```

3. **Reload Nginx**: If the configuration test is successful, reload Nginx to apply the changes.

```bash
sudo systemctl reload nginx
```

#### 7.3 Verify the Deployment

Open a web browser and navigate to your domain or your VPS's IP address to verify that your application is running correctly.

### 8. Troubleshooting

While the deployment process is designed to be straightforward, you may encounter issues or errors along the way. In this section, we'll cover some common problems and their potential solutions to help you troubleshoot and resolve any hiccups you might face.

#### 8.1 Permission Denied Errors

If you encounter "Permission denied" errors when trying to access or modify files or directories on the server, it's likely due to incorrect file permissions. To resolve this:

1. Ensure you're running commands with `sudo` when required.
2. Check the file/directory permissions and ownership using commands like `ls -l` and `stat`.
3. If necessary, adjust the permissions using `chmod` and the ownership using `chown`.

For example, to grant read, write, and execute permissions to the current user for a directory:

```bash
sudo chmod 700 /path/to/directory
```

#### 8.2 SSH Connection Issues

If you're having trouble connecting to your VPS via SSH, double-check the following:

1. Verify that your SSH key is correctly added to the server's authorized keys file (`~/.ssh/authorized_keys`).
2. If you're using a custom SSH port, ensure you're specifying the correct port in the SSH command (e.g., `ssh -p 2222 user@host`).
3. Check if the SSH service is running on the server (`sudo systemctl status ssh`).
4. Ensure that your server's firewall is configured to allow incoming SSH connections.

#### 8.3 Nginx Configuration Errors

When making changes to your Nginx configuration, it's essential to test for syntax errors before reloading the service. If you encounter configuration errors:

1. Run `sudo nginx -t` to check for syntax errors in your configuration files.
2. Review the error messages carefully, as they often provide helpful information about the specific issue.
3. Double-check your server block configurations, paying close attention to paths, directives, and syntax.
4. Consult the Nginx documentation for guidance on specific directives or configurations.

### 9. Conclusion

Congratulations, you've successfully learned how to deploy your application on a VPS using Nginx.

Remember, the deployment process is just the beginning. As your application grows and evolves, you may need to consider additional features like load balancing, caching, and performance optimization. Fortunately, Nginx provides a wealth of features and modules to support your application's scalability and performance requirements.

Stay tuned for new posts covering those topics. Happy coding!

### 10. Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Linode Documentation](https://www.linode.com/docs/)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Linode VPS Management](https://www.linode.com/docs/getting-started/)
- [SSL/TLS Encryption with Nginx](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Nginx Caching](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_path)
- [Nginx Gzip Compression](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
