# Phase 4: CI/CD & Deployment

> **Goal:** Automated deployment pipeline with zero-downtime updates when main branch changes.
>
> **Milestone:** Push to main triggers automatic build and deploy to homelab with no service interruption.

---

## Overview

Phase 4 sets up the complete deployment infrastructure:

- **Docker** - Containerized application for consistent deployments
- **CI/CD Pipeline** - GitHub Actions to build and deploy on push to main
- **Zero-Downtime Deployment** - Rolling updates or blue-green deployment
- **Reverse Proxy** - Nginx for SSL termination, load balancing, and routing
- **Cloudflare** - DNS, CDN, SSL certificates, and DDoS protection
- **Homelab** - Self-hosted Linux server running the application

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE                                     │
│  • DNS Management                                                        │
│  • SSL/TLS (Full Strict)                                                │
│  • CDN & Caching                                                        │
│  • DDoS Protection                                                      │
│  • Cloudflare Tunnel (cloudflared)                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                          Cloudflare Tunnel
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        HOMELAB SERVER                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         NGINX                                    │   │
│  │  • Reverse Proxy                                                 │   │
│  │  • Load Balancing (upstream)                                     │   │
│  │  • Health Checks                                                 │   │
│  │  • Request Routing                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                          │              │                               │
│                          ▼              ▼                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐           │
│  │   WORKBENCH (Blue)       │  │   WORKBENCH (Green)      │           │
│  │   Container :3000        │  │   Container :3001        │           │
│  │   (Active)               │  │   (Standby/New Version)  │           │
│  └──────────────────────────┘  └──────────────────────────┘           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      DOCKER NETWORK                              │   │
│  │  • workbench-network (bridge)                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEON DATABASE                                  │
│  • Serverless PostgreSQL (external)                                     │
│  • Connection via DATABASE_URL                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Current State

| Component        | Status       |
| ---------------- | ------------ |
| Application code | ✅ Complete  |
| Database (Neon)  | ✅ Complete  |
| GitHub OAuth     | ✅ Complete  |
| Docker setup     | ❌ Not built |
| CI/CD pipeline   | ❌ Not built |
| Nginx config     | ❌ Not built |
| Cloudflare setup | ❌ Not built |
| Homelab setup    | ❌ Not built |

---

## Epic 1: Docker Setup

### 1.1 Dockerfile

**Priority:** P0 - Blocker
**Estimate:** Small

Create optimized Dockerfile for Next.js application.

**Tasks:**

- [ ] Create `Dockerfile` in project root
- [ ] Multi-stage build for smaller image size
- [ ] Stage 1: Dependencies (node_modules)
- [ ] Stage 2: Builder (next build)
- [ ] Stage 3: Runner (production image)
- [ ] Use `node:20-alpine` as base image
- [ ] Configure for standalone output mode
- [ ] Set proper NODE_ENV=production
- [ ] Expose port 3000
- [ ] Add healthcheck endpoint
- [ ] Create `.dockerignore` file

**Dockerfile Template:**

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Acceptance Criteria:**

- Docker image builds successfully
- Image size < 200MB
- Container starts and serves application
- Health check works

---

### 1.2 Next.js Standalone Output

**Priority:** P0 - Blocker
**Estimate:** Small

Configure Next.js for standalone output mode.

**Tasks:**

- [ ] Update `next.config.ts` with output: 'standalone'
- [ ] Verify build produces standalone folder
- [ ] Test standalone server works locally

**next.config.ts update:**

```typescript
const nextConfig = {
  output: 'standalone',
  // ... existing config
};
```

**Acceptance Criteria:**

- `pnpm build` produces `.next/standalone` folder
- Standalone server runs independently

---

### 1.3 Health Check Endpoint

**Priority:** P0 - Blocker
**Estimate:** Small

Create health check API route for container orchestration.

**Tasks:**

- [ ] Create `app/api/health/route.ts`
- [ ] Return 200 OK when healthy
- [ ] Check database connectivity (optional)
- [ ] Return proper JSON response

**Health endpoint:**

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

**Acceptance Criteria:**

- `/api/health` returns 200 when app is running
- Response includes timestamp for debugging

---

### 1.4 Docker Compose (Development)

**Priority:** P1 - Important
**Estimate:** Small

Docker Compose for local development and testing.

**Tasks:**

- [ ] Create `docker-compose.yml`
- [ ] Define workbench service
- [ ] Mount environment variables
- [ ] Set up network
- [ ] Add volume for development (optional)
- [ ] Create `docker-compose.prod.yml` for production

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  workbench:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - workbench-network

networks:
  workbench-network:
    driver: bridge
```

**Acceptance Criteria:**

- `docker-compose up` builds and runs application
- Application accessible on localhost:3000
- Health checks pass

---

### 1.5 Docker Ignore File

**Priority:** P1 - Important
**Estimate:** Small

Optimize Docker build context.

**Tasks:**

- [ ] Create `.dockerignore` file
- [ ] Exclude node_modules, .next, .git
- [ ] Exclude development files
- [ ] Exclude documentation

**.dockerignore:**

```
# Dependencies
node_modules
.pnpm-store

# Build output
.next
out

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Environment
.env*
!.env.example

# Documentation
docs
*.md
!README.md

# Tests
tests
__tests__
*.test.*
*.spec.*

# Misc
.DS_Store
*.log
```

**Acceptance Criteria:**

- Build context is minimal
- Build time improved
- No sensitive files in image

---

## Epic 2: CI/CD Pipeline

### 2.1 GitHub Actions Workflow

**Priority:** P0 - Blocker
**Estimate:** Medium

Main CI/CD workflow for build and deploy.

**Tasks:**

- [ ] Create `.github/workflows/deploy.yml`
- [ ] Trigger on push to main branch
- [ ] Build Docker image
- [ ] Push to container registry (GitHub Container Registry)
- [ ] Deploy to homelab via SSH
- [ ] Run health check after deploy
- [ ] Notify on failure (optional)

**deploy.yml:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Homelab
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOMELAB_HOST }}
          username: ${{ secrets.HOMELAB_USER }}
          key: ${{ secrets.HOMELAB_SSH_KEY }}
          script: |
            cd /opt/workbench
            ./deploy.sh ${{ github.sha }}

      - name: Health Check
        run: |
          sleep 30
          curl -f ${{ secrets.HEALTH_CHECK_URL }} || exit 1
```

**Acceptance Criteria:**

- Push to main triggers workflow
- Docker image built and pushed to GHCR
- Deployment script executed on homelab
- Health check confirms deployment success

---

### 2.2 GitHub Secrets Configuration

**Priority:** P0 - Blocker
**Estimate:** Small

Configure required secrets in GitHub repository.

**Tasks:**

- [ ] Add `HOMELAB_HOST` - homelab IP or domain
- [ ] Add `HOMELAB_USER` - SSH username
- [ ] Add `HOMELAB_SSH_KEY` - SSH private key
- [ ] Add `HEALTH_CHECK_URL` - public health endpoint URL
- [ ] Document all required secrets

**Required Secrets:**

| Secret             | Description                              |
| ------------------ | ---------------------------------------- |
| `HOMELAB_HOST`     | IP address or hostname of homelab server |
| `HOMELAB_USER`     | SSH user for deployment                  |
| `HOMELAB_SSH_KEY`  | SSH private key (ed25519 recommended)    |
| `HEALTH_CHECK_URL` | Full URL to health check endpoint        |

**Acceptance Criteria:**

- All secrets configured in GitHub
- Workflow can authenticate to homelab
- Secrets are not exposed in logs

---

### 2.3 Deployment Script

**Priority:** P0 - Blocker
**Estimate:** Medium

Zero-downtime deployment script for homelab.

**Tasks:**

- [ ] Create `deploy/deploy.sh` script
- [ ] Pull latest image from registry
- [ ] Implement blue-green deployment
- [ ] Health check new container before switching
- [ ] Update Nginx upstream
- [ ] Reload Nginx without downtime
- [ ] Cleanup old containers
- [ ] Rollback on failure

**deploy.sh:**

```bash
#!/bin/bash
set -e

# Configuration
IMAGE="ghcr.io/alasdair-roddick/workbench"
TAG="${1:-latest}"
CONTAINER_NAME="workbench"
BLUE_PORT=3000
GREEN_PORT=3001
NGINX_UPSTREAM="/etc/nginx/conf.d/workbench-upstream.conf"
ENV_FILE="/opt/workbench/.env.production"

# Determine current active container
CURRENT_ACTIVE=$(docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | head -1)

if [[ "$CURRENT_ACTIVE" == "${CONTAINER_NAME}-blue" ]]; then
    NEW_NAME="${CONTAINER_NAME}-green"
    NEW_PORT=$GREEN_PORT
    OLD_NAME="${CONTAINER_NAME}-blue"
else
    NEW_NAME="${CONTAINER_NAME}-blue"
    NEW_PORT=$BLUE_PORT
    OLD_NAME="${CONTAINER_NAME}-green"
fi

echo "🚀 Deploying $IMAGE:$TAG as $NEW_NAME on port $NEW_PORT"

# Pull latest image
echo "📦 Pulling image..."
docker pull "$IMAGE:$TAG"

# Start new container
echo "🐳 Starting new container..."
docker run -d \
    --name "$NEW_NAME" \
    --env-file "$ENV_FILE" \
    --network workbench-network \
    -p "$NEW_PORT:3000" \
    --restart unless-stopped \
    "$IMAGE:$TAG"

# Wait for health check
echo "🏥 Waiting for health check..."
RETRIES=30
until docker exec "$NEW_NAME" wget --spider -q http://localhost:3000/api/health 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo "❌ Health check failed, rolling back..."
        docker stop "$NEW_NAME" && docker rm "$NEW_NAME"
        exit 1
    fi
    sleep 2
done

echo "✅ New container is healthy"

# Update Nginx upstream
echo "🔄 Updating Nginx upstream..."
cat > "$NGINX_UPSTREAM" << EOF
upstream workbench {
    server 127.0.0.1:$NEW_PORT;
}
EOF

# Reload Nginx
echo "🔃 Reloading Nginx..."
nginx -t && nginx -s reload

# Stop old container
if [ -n "$OLD_NAME" ] && docker ps -q --filter "name=$OLD_NAME" | grep -q .; then
    echo "🛑 Stopping old container..."
    docker stop "$OLD_NAME" && docker rm "$OLD_NAME"
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Deployment complete!"
```

**Acceptance Criteria:**

- Script deploys new version without downtime
- Automatic rollback on health check failure
- Old containers cleaned up
- Nginx reloaded gracefully

---

### 2.4 Rollback Script

**Priority:** P1 - Important
**Estimate:** Small

Manual rollback capability.

**Tasks:**

- [ ] Create `deploy/rollback.sh` script
- [ ] Accept image tag as argument
- [ ] Revert to specified version
- [ ] Use same deployment logic

**rollback.sh:**

```bash
#!/bin/bash
set -e

TAG="${1:-}"

if [ -z "$TAG" ]; then
    echo "Usage: ./rollback.sh <image-tag>"
    echo "Available tags:"
    docker images ghcr.io/alasdair-roddick/workbench --format "{{.Tag}}"
    exit 1
fi

echo "🔙 Rolling back to version: $TAG"
./deploy.sh "$TAG"
```

**Acceptance Criteria:**

- Can rollback to any previous version
- Uses same zero-downtime process

---

## Epic 3: Nginx Configuration

### 3.1 Nginx Installation and Setup

**Priority:** P0 - Blocker
**Estimate:** Small

Install and configure Nginx on homelab.

**Tasks:**

- [ ] Install Nginx on homelab server
- [ ] Create configuration directory structure
- [ ] Set up log rotation
- [ ] Enable and start Nginx service

**Commands:**

```bash
# Install Nginx
sudo apt update && sudo apt install nginx -y

# Enable and start
sudo systemctl enable nginx
sudo systemctl start nginx

# Create config directory
sudo mkdir -p /etc/nginx/conf.d
```

**Acceptance Criteria:**

- Nginx installed and running
- Systemd service enabled

---

### 3.2 Nginx Site Configuration

**Priority:** P0 - Blocker
**Estimate:** Small

Configure Nginx as reverse proxy.

**Tasks:**

- [ ] Create `/etc/nginx/sites-available/workbench`
- [ ] Configure reverse proxy to upstream
- [ ] Set up proper headers
- [ ] Configure WebSocket support (for hot reload if needed)
- [ ] Enable site

**workbench.conf:**

```nginx
# /etc/nginx/conf.d/workbench-upstream.conf
upstream workbench {
    server 127.0.0.1:3000;
}

# /etc/nginx/sites-available/workbench
server {
    listen 80;
    server_name workbench.yourdomain.com;

    # Redirect to HTTPS (handled by Cloudflare, but good practice)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://workbench;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Health check endpoint (for monitoring)
    location /api/health {
        proxy_pass http://workbench;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Static file caching (Next.js static assets)
    location /_next/static {
        proxy_pass http://workbench;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Acceptance Criteria:**

- Nginx proxies requests to application
- Headers properly forwarded
- Static assets cached

---

### 3.3 Nginx Security Hardening

**Priority:** P1 - Important
**Estimate:** Small

Security best practices for Nginx.

**Tasks:**

- [ ] Hide Nginx version
- [ ] Configure rate limiting
- [ ] Set security headers
- [ ] Limit request body size

**Security additions:**

```nginx
# In http block (/etc/nginx/nginx.conf)
server_tokens off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# In server block
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://workbench;
    # ... rest of proxy config
}

# Security headers (some may be redundant with Cloudflare)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**Acceptance Criteria:**

- Version hidden from responses
- Rate limiting active
- Security headers present

---

## Epic 4: Cloudflare Setup

### 4.1 Cloudflare DNS Configuration

**Priority:** P0 - Blocker
**Estimate:** Small

Configure DNS in Cloudflare.

**Tasks:**

- [ ] Add domain to Cloudflare
- [ ] Configure A/AAAA record for workbench subdomain
- [ ] Enable Cloudflare proxy (orange cloud)
- [ ] Set SSL/TLS mode to "Full (strict)"

**DNS Records:**

| Type | Name      | Content             | Proxy   |
| ---- | --------- | ------------------- | ------- |
| A    | workbench | (Cloudflare Tunnel) | Proxied |

**Acceptance Criteria:**

- DNS resolves correctly
- Traffic flows through Cloudflare

---

### 4.2 Cloudflare Tunnel Setup

**Priority:** P0 - Blocker
**Estimate:** Medium

Set up Cloudflare Tunnel for secure connection without exposing ports.

**Tasks:**

- [ ] Install `cloudflared` on homelab
- [ ] Authenticate with Cloudflare
- [ ] Create tunnel
- [ ] Configure tunnel to point to Nginx
- [ ] Set up as systemd service
- [ ] Add DNS route for tunnel

**Cloudflare Tunnel Setup:**

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create workbench

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: <TUNNEL_ID>
credentials-file: /home/<user>/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: workbench.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
EOF

# Route DNS
cloudflared tunnel route dns workbench workbench.yourdomain.com

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**Acceptance Criteria:**

- Tunnel established and running
- No inbound ports exposed on homelab
- Traffic routed through tunnel

---

### 4.3 Cloudflare Page Rules & Caching

**Priority:** P1 - Important
**Estimate:** Small

Configure caching and performance rules.

**Tasks:**

- [ ] Create page rule for static assets caching
- [ ] Configure cache TTL for `/_next/static/*`
- [ ] Set up APO or similar for edge caching (optional)
- [ ] Configure minification settings

**Page Rules:**

| URL Pattern        | Setting        | Value            |
| ------------------ | -------------- | ---------------- |
| `*/_next/static/*` | Cache Level    | Cache Everything |
| `*/_next/static/*` | Edge Cache TTL | 1 month          |
| `/api/*`           | Cache Level    | Bypass           |

**Acceptance Criteria:**

- Static assets cached at edge
- API routes not cached
- Improved load times

---

### 4.4 Cloudflare Security Settings

**Priority:** P1 - Important
**Estimate:** Small

Configure security settings in Cloudflare.

**Tasks:**

- [ ] Enable "Under Attack Mode" toggle (manual)
- [ ] Configure WAF rules (if on paid plan)
- [ ] Set up Bot Fight Mode
- [ ] Configure SSL/TLS minimum version
- [ ] Enable HSTS

**Recommended Settings:**

| Setting             | Value              |
| ------------------- | ------------------ |
| SSL/TLS Mode        | Full (strict)      |
| Minimum TLS Version | 1.2                |
| Always Use HTTPS    | On                 |
| HSTS                | Enabled (6 months) |
| Bot Fight Mode      | On                 |

**Acceptance Criteria:**

- HTTPS enforced
- Basic bot protection enabled
- Security headers configured

---

## Epic 5: Homelab Server Setup

### 5.1 Server Initial Setup

**Priority:** P0 - Blocker
**Estimate:** Medium

Prepare homelab server for deployments.

**Tasks:**

- [ ] Create deployment user (`deploy`)
- [ ] Set up SSH key authentication
- [ ] Disable password SSH authentication
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall (UFW)
- [ ] Set up automatic security updates

**Setup Commands:**

```bash
# Create user
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy

# SSH key setup (on your local machine)
ssh-keygen -t ed25519 -C "github-actions-deploy"
# Copy public key to server's authorized_keys

# Disable password auth
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp  # Only if not using Cloudflare Tunnel
sudo ufw enable

# Auto updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Acceptance Criteria:**

- Deploy user can SSH with key
- Docker installed and working
- Firewall configured

---

### 5.2 Deployment Directory Structure

**Priority:** P0 - Blocker
**Estimate:** Small

Set up directory structure for deployments.

**Tasks:**

- [ ] Create `/opt/workbench` directory
- [ ] Create subdirectories for scripts, logs
- [ ] Set proper ownership and permissions
- [ ] Place deployment scripts

**Directory Structure:**

```
/opt/workbench/
├── deploy.sh
├── rollback.sh
├── .env.production
├── logs/
│   └── deploy.log
└── backups/
```

**Commands:**

```bash
sudo mkdir -p /opt/workbench/{logs,backups}
sudo chown -R deploy:deploy /opt/workbench
chmod +x /opt/workbench/*.sh
```

**Acceptance Criteria:**

- Directory structure created
- Proper permissions set
- Scripts executable

---

### 5.3 Environment Configuration

**Priority:** P0 - Blocker
**Estimate:** Small

Set up production environment variables.

**Tasks:**

- [ ] Create `/opt/workbench/.env.production`
- [ ] Configure all required environment variables
- [ ] Secure file permissions (600)

**.env.production:**

```env
# Database
DATABASE_URL=postgres://...@neon.tech/workbench

# Auth
NEXTAUTH_SECRET=<generate-secure-secret>
NEXTAUTH_URL=https://workbench.yourdomain.com
GITHUB_CLIENT_ID=<production-client-id>
GITHUB_CLIENT_SECRET=<production-client-secret>

# App
NEXT_PUBLIC_APP_URL=https://workbench.yourdomain.com
NODE_ENV=production
```

**Commands:**

```bash
sudo chmod 600 /opt/workbench/.env.production
sudo chown deploy:deploy /opt/workbench/.env.production
```

**Acceptance Criteria:**

- Environment file created
- File permissions restricted
- All variables configured

---

### 5.4 Docker Network Setup

**Priority:** P0 - Blocker
**Estimate:** Small

Create Docker network for containers.

**Tasks:**

- [ ] Create `workbench-network` Docker network
- [ ] Configure as bridge network

**Commands:**

```bash
docker network create workbench-network
```

**Acceptance Criteria:**

- Network created
- Containers can communicate

---

### 5.5 Log Management

**Priority:** P1 - Important
**Estimate:** Small

Set up logging for deployments and application.

**Tasks:**

- [ ] Configure Docker logging driver
- [ ] Set up log rotation
- [ ] Create deployment log

**Docker daemon config (`/etc/docker/daemon.json`):**

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**Acceptance Criteria:**

- Logs don't fill disk
- Deployment history tracked

---

## Epic 6: Monitoring & Alerting (Optional)

### 6.1 Uptime Monitoring

**Priority:** P2 - Nice to Have
**Estimate:** Small

Set up external uptime monitoring.

**Tasks:**

- [ ] Set up UptimeRobot or Cloudflare Health Checks
- [ ] Monitor `/api/health` endpoint
- [ ] Configure alerts (email/Discord/Slack)

**Acceptance Criteria:**

- Downtime alerts received
- Response time tracked

---

### 6.2 Container Monitoring

**Priority:** P2 - Nice to Have
**Estimate:** Medium

Monitor container health and resources.

**Tasks:**

- [ ] Install Portainer (optional, for UI)
- [ ] Set up container health monitoring
- [ ] Configure resource alerts

**Acceptance Criteria:**

- Can view container status
- Alerts on container crash

---

## Dependencies and Prerequisites

### Required Software on Homelab

| Software       | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| Docker         | 24+     | Container runtime       |
| Docker Compose | 2.x     | Container orchestration |
| Nginx          | 1.18+   | Reverse proxy           |
| cloudflared    | Latest  | Cloudflare Tunnel       |

### Required Accounts/Services

| Service    | Purpose                                   |
| ---------- | ----------------------------------------- |
| GitHub     | Code hosting, Actions, Container Registry |
| Cloudflare | DNS, CDN, Tunnel                          |
| Neon       | PostgreSQL database                       |

---

## Recommended Implementation Order

### Phase 4.1: Docker Foundation (Day 1-2)

1. Dockerfile (1.1)
2. Next.js Standalone Output (1.2)
3. Health Check Endpoint (1.3)
4. Docker Compose (1.4)
5. Docker Ignore (1.5)

### Phase 4.2: Homelab Setup (Day 3-4)

1. Server Initial Setup (5.1)
2. Deployment Directory Structure (5.2)
3. Environment Configuration (5.3)
4. Docker Network Setup (5.4)

### Phase 4.3: Nginx & Cloudflare (Day 5-6)

1. Nginx Installation (3.1)
2. Nginx Site Configuration (3.2)
3. Cloudflare Tunnel Setup (4.2)
4. Cloudflare DNS Configuration (4.1)

### Phase 4.4: CI/CD Pipeline (Day 7-8)

1. GitHub Actions Workflow (2.1)
2. GitHub Secrets Configuration (2.2)
3. Deployment Script (2.3)
4. Rollback Script (2.4)

### Phase 4.5: Polish (Day 9-10)

1. Nginx Security Hardening (3.3)
2. Cloudflare Page Rules (4.3)
3. Cloudflare Security Settings (4.4)
4. Log Management (5.5)

---

## Success Metrics

- [ ] `git push origin main` triggers automatic deployment
- [ ] Deployment completes in < 5 minutes
- [ ] Zero downtime during deployments
- [ ] Health check passes after deployment
- [ ] Can rollback to previous version in < 2 minutes
- [ ] Site accessible via custom domain with HTTPS
- [ ] No ports exposed directly to internet

---

## Open Questions

1. **Domain:** What domain/subdomain will Workbench use?
   - _Action needed:_ Confirm domain

2. **Cloudflare Plan:** Free tier or paid?
   - _Recommendation:_ Free tier is sufficient for personal project

3. **Monitoring:** Need uptime monitoring?
   - _Recommendation:_ UptimeRobot free tier is good enough

4. **Backups:** Need application-level backups beyond Neon?
   - _Recommendation:_ Neon handles DB backups, images stored in GHCR

5. **Multiple environments:** Need staging environment?
   - _Recommendation:_ Not for Phase 4, can add later

---

## Security Checklist

- [ ] SSH key-only authentication
- [ ] Firewall configured (UFW)
- [ ] Cloudflare Tunnel (no exposed ports)
- [ ] Environment variables secured (600 permissions)
- [ ] GitHub secrets configured (not in code)
- [ ] Production GitHub OAuth app (separate from dev)
- [ ] HTTPS enforced via Cloudflare
- [ ] Rate limiting on API routes
- [ ] Docker containers run as non-root

---

_Document created: January 2026_
_Phase: 4 of 8_
_Status: Planning_
