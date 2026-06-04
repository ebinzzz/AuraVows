# Production Readiness & Deployment Guide (Hostinger / VPS)

This guide provides the necessary steps to deploy AuraVows to a production environment like Hostinger VPS.

## ✅ Completed Adjustments
- **Database Schema**: All columns use `IF NOT EXISTS`. Dynamic fields (wording, quotes, verses) are fully integrated.
- **Branding**: The system is fully rebranded as **AuraVows**.
- **Containerization**: Added `Dockerfile` for both Backend and Frontend, and a `docker-compose.yml` for easy orchestration.
- **Security**: CORS settings and Secret Keys are now configurable via environment variables.

## 🚀 Quick Start Deployment (Docker Compose)

1. **Clone the repository** on your VPS.
2. **Configure Environment**: Create a `.env` file in the root directory (where `docker-compose.yml` is):
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=auravows
   SECRET_KEY=generate_a_random_string_here
   ALLOWED_ORIGINS=https://yourdomain.com
   VITE_API_URL=https://yourdomain.com
   ```
3. **Build and Run**:
   ```bash
   docker compose up -d --build
   ```

## 🛠️ Security Checklist
- [ ] **Change Admin Password**: The default password is `adminpassword`. Change this immediately after first login.
- [ ] **Update SECRET_KEY**: Generate a unique random string for `SECRET_KEY`.
- [ ] **Enable SSL/HTTPS**: Use a reverse proxy like Nginx or Traefik with Let's Encrypt.
- [ ] **Restrict CORS**: Set `ALLOWED_ORIGINS` to your specific domain.

## 📈 Infrastructure Recommendations
- **Reverse Proxy**: Hostinger usually uses Nginx. Point Nginx to port `80` (where Docker frontend is listening).
- **Persistent Storage**: Ensure the `./backend/static` volume is backed up, as it contains all uploaded photos and music.
- **Database Backups**: Use `pg_dump` to regularly backup the `postgres_data` volume.

## 📝 Hostinger Specific Tips
- If using Hostinger Shared Hosting (not VPS), you will need to host the Frontend static files in `public_html` and run the Python backend as a background process (if supported) or via a separate VPS. **VPS is highly recommended for this stack.**
- Ensure ports `80` and `443` are open in your Hostinger firewall.
