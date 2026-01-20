# Local Setup (XAMPP + Vite)

This guide covers a full local setup using XAMPP (PHP + MySQL) and Vite for the frontend. Although it can run on XAMPP smoothly I recommend taking a look a the setup demonstrated in <a href="Backend%20Documentation.md" target="_blank" rel="noreferrer">Backend Documentation</a>.

Production Example: https://grms.nickelcy.com

Start XAMPP
- Launch Apache and MySQL from the XAMPP control panel.

Backend Setup (PHP)
1) Place the `Backend` folder inside `htdocs`.
2) Run Composer install:
```bash
cd Backend
composer install
```
3) Copy `example.env` to `.env` and set MySQL credentials (typically `root` / empty password).
4) Use Apache to serve the API:
   - Open `http://localhost/Backend/api` once to auto-initialize the database.
   (**Note**: There is a sql dump file but we recommend that you not use it because the applicaiton auto-initialize when the endpoint `http://localhost/Backend/api` is accessed)
6) Log in with the default admin:
   - Staff ID: `A-0001`
   - Password: `admin`

Frontend Setup (Vite)
1) Navigate to the frontend folder.
2) Install dependencies and run dev server:
```bash
npm install
npm run dev
```
3) Ensure `VITE_API_BASE_URL=http://localhost/Backend/api`.

Connect & Test
- Open the frontend URL (usually `http://localhost:5173`).
- Log in using the admin credentials.
- Create users, classes, students, and test grade entry.

Done
- Backend served via PHP/MySQL (XAMPP).
- Frontend served via Vite.
- Full Grade Management system running locally.
