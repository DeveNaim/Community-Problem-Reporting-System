# Deployment Notes

Production deployment guide for the Community Problem Reporting System (CPRS).

## Architecture

| Component | Default | Production |
|-----------|---------|------------|
| Client | Vite dev server `:5173` | Static build served by Nginx/CDN |
| API | Express `:5000` | Node.js behind reverse proxy |
| Database | MongoDB local | MongoDB Atlas or managed instance |
| Images | `server/uploads/` | Local disk or S3/Cloudinary |

## Environment variables (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Strong random secret — **never use default in production** |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `24h`) |
| `CLIENT_URL` | Yes | Frontend URL for password reset links |
| `SMTP_*` | No | Email for forgot-password and status notifications |
| `EMAIL_NOTIFICATIONS` | No | Set `false` to disable status emails |

## Build & run (production)

### Centralized Build & Start (Recommended)

From the project root:
```bash
npm run install:all
npm run build         # compiles client/dist
npm start             # starts server & client preview
```

### Or Build & Run Separately

#### API

```bash
cd server
npm ci --production
cp .env.example .env   # configure for production
npm start
```

Use a process manager (PM2, systemd) to keep the API running.

### Client

```bash
cd client
npm ci
npm run build
```

Serve `client/dist/` as static files. Configure the web server to:

1. Serve the SPA (`index.html` for unknown routes)
2. Proxy `/api` and `/uploads` to the Express server

Example Nginx snippet:

```nginx
location /api {
  proxy_pass http://127.0.0.1:5000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

location /uploads {
  proxy_pass http://127.0.0.1:5000;
}

location / {
  root /var/www/cprs/client/dist;
  try_files $uri $uri/ /index.html;
}
```

## HTTPS

SRS Section 12 requires HTTPS in production. Terminate TLS at Nginx, a load balancer, or your cloud provider — do not expose the API on plain HTTP publicly.

## MongoDB

- Create a dedicated database user with least privilege
- Enable authentication on MongoDB
- Back up regularly (complaints + user data)

## File uploads

- Ensure `server/uploads/` is writable by the API process
- For multi-instance deployments, use shared storage (NFS, S3) — local disk only works on a single server
- Consider moving to cloud object storage for scale

## Seed data

**Do not run `npm run seed` in production.** It creates test accounts with known passwords. Use seed only in development/staging.

## Health check

Monitor `GET /api/health` — expect `{ "status": "ok", "db": "connected" }`.

## Post-deploy verification

1. Register a test citizen (or use staging seed)
2. Submit a complaint end-to-end through admin and authority
3. Confirm CSV export from admin analytics
4. Review `docs/ACCEPTANCE.md` checklist
