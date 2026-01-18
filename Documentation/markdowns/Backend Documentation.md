# Backend Documentation

Overview
This guide explains how to run the GradeManagement backend locally.

Prerequisites
- PHP (run `php -v` to check)
- Composer (run `composer --version`)
- MySQL or MariaDB (or Docker if you prefer not to install MySQL locally)
- Optional: Git if you want to clone the repository

Quick summary
1. Install PHP dependencies
2. Ensure your database server is running (the app auto-creates the `grms` database, schema, and seed when you visit `/api`)
3. Configure the environment file
4. Start the API server and test

Detailed steps

1) Get the code
- If you already have the project files, skip this step.

2) Install PHP dependencies
```bash
cd Backend
composer install
```

3) Configure environment variables
```bash
cp example.env .env
```
- Edit `.env` to match your database settings.

Example `.env` database settings:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=grms
DB_USERNAME=root
DB_PASSWORD=root
```

4) Initialize the database (automatic)
- The API auto-creates the database, schema, and seed when you visit `/api`.
- Make sure your DB server is running and `.env` is configured.

5) Start the API server
```bash
cd Backend
php -S localhost:8001 -t api
```

- Open `http://localhost:8001/api` to trigger initialization.
- If port `8001` is in use, pick another port.

Troubleshooting tips
- "Command not found": install the missing tool (PHP, Composer, or Docker).
- "Access denied": verify DB credentials in `.env`.
- "Port already in use": pick another port.

Last updated: January 2026
