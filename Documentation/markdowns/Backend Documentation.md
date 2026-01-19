# Backend Documentation

Overview
This guide explains how to run the GradeManagement backend locally (bare PHP or Docker Compose).

Prerequisites
- PHP (run `php -v` to check) if running without Docker
- Composer (run `composer --version`) if running without Docker
- MySQL or MariaDB if running without Docker
- Docker + Docker Compose if running with containers
- Optional: Git if you want to clone the repository

Quick summary
1. Choose a run mode: bare PHP or Docker Compose
2. Configure environment variables
3. Start the API server and test

Detailed steps

1) Get the code
- If you already have the project files, skip this step.

2) Install PHP dependencies (bare PHP)
```bash
cd Backend
composer install
```

3) Configure environment variables (bare PHP)
```bash
cp example.env .env
```
- Edit `.env` to match your database settings.

Example `.env` database settings:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=grms
DB_USER=root
DB_PASS=root
```

4) Initialize the database (automatic)
- The API initializes the database only if it does not exist or has no tables.
- Make sure your DB server is running and `.env` is configured.

5) Start the API server (bare PHP)
```bash
cd Backend
php -S localhost:8001 -t api
```

- Open `http://localhost:8001/api` to trigger initialization.
- If port `8001` is in use, pick another port.

Docker Compose option

1) Build and start services
```bash
cd Backend
docker compose up --build
```

2) Open the API
- Open `http://localhost:8080/api`.
- Nginx proxies requests to the PHP container.

Notes
- The compose file exposes MySQL on `127.0.0.1:3307` (host) -> `3306` (container).
- The API container talks to MySQL via `DB_HOST=mysql` and `DB_PORT=3306`.

Troubleshooting tips
- "Command not found": install the missing tool (PHP, Composer, or Docker).
- "Access denied": verify DB credentials in `.env`.
- "Port already in use": pick another port.

Last updated: January 2026
