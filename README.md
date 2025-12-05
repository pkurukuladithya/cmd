# Chemistry by CMD LMS ✨

Modern MERN-powered LMS focused on Google-first sign-in, smooth navigation, and clean sections for Home, Assignments, Classes, and About.

Owner: **Praveena Kurukuladithya**

---

## 🗂️ Project Structure
- `Backend/` — Express + MongoDB API (auth, users, tasks)
- `Frontend/` — React + Vite + Tailwind UI

---

## 🚀 Quick Start (TL;DR)
1) Install Node.js 18+ from <https://nodejs.org/en/download>  
2) Install MongoDB Community Server + Compass (GUI): <https://www.mongodb.com/try/download/community> and <https://www.mongodb.com/try/download/compass>  
3) Clone the repo:
```bash
git clone https://github.com/your-username/chemistry-by-cmd.git
cd chemistry-by-cmd
```
4) Backend setup:
```bash
cd Backend
npm install
cp .env.example .env   # create/update .env with your values
npm run dev
```
5) Frontend setup:
```bash
cd ../Frontend
npm install
cp .env.example .env   # create/update VITE_API_URL
npm run dev
```
6) Open the frontend dev server (default Vite: <http://localhost:5173>). Backend runs at <http://localhost:5000>.

---

## 🧰 Prerequisites (Beginner Friendly)
### Install Node.js
- Download LTS installer: <https://nodejs.org/en/download>  
- Run installer → keep defaults → restart terminal.  
- Verify:
```bash
node -v
npm -v
```

### Install Git
- Download: <https://git-scm.com/downloads>  
- Install with defaults.  
- Verify:
```bash
git --version
```

### Install MongoDB Community Server
1. Download MSI/installer: <https://www.mongodb.com/try/download/community>
2. Choose **Current Release**, platform = Windows (or your OS).
3. During install:
   - Select **Complete**.
   - Check **Install MongoDB as a Service** (recommended).
   - Optionally install MongoDB Compass when prompted (or install separately below).
4. After install, MongoDB service should start automatically.
5. Verify from a new terminal:
```bash
mongo --version  # or mongosh --version depending on your install
```

### Install MongoDB Compass (GUI)
- Download: <https://www.mongodb.com/try/download/compass>  
- Install with defaults.  
- Open Compass and connect to your local server using the default URI:
```
mongodb://127.0.0.1:27017
```
- Create a database named `cmd_database` if you like (the app will also create collections on first use).

---

## 📥 Clone the Repository
```bash
git clone https://github.com/your-username/chemistry-by-cmd.git
cd chemistry-by-cmd
```

---

## 🔑 Environment Variables
### Backend (`Backend/.env`)
Create `.env` using these keys:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cmd_database
JWT_SECRET=supersecretjwtkey
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=admin
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

> Get Google credentials from Google Cloud Console → APIs & Services → Credentials → Create OAuth client (Web).  
> Add authorized origins: `http://localhost:5173` and `http://localhost:5000` (optional).  
> Add redirect: `http://localhost:5000/api/auth/google/callback`.

### Frontend (`Frontend/.env`)
```
VITE_API_URL=http://localhost:5000
```

---

## 🖥️ Backend Setup
```bash
cd Backend
npm install
# ensure .env is configured
npm run dev   # nodemon dev server
```
- API base: `http://localhost:5000`
- Seeds an admin user on start:
  - Email: `admin@gmail.com`
  - Password: from `.env` `ADMIN_PASSWORD` (default `admin`)

---

## 🎨 Frontend Setup
```bash
cd Frontend
npm install
# ensure .env is configured
npm run dev   # Vite dev server
```
- Opens (by default) at `http://localhost:5173`.
- Uses Tailwind CSS and hits the backend at `VITE_API_URL`.

---

## 🔑 Auth Flow (Google-first)
- Home shows “Get started” / “Sign up” (Google).  
- If Google email exists → user is signed in and welcomed (name + avatar).  
- If Google email is new → prompted to complete signup, then signed in.  
- Header shows avatar/name when signed in; logout clears session.

---

## 🧪 Useful Commands
### Backend
- `npm run dev` — start dev server with nodemon
- `npm start` — start server with node

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

---

## 🛠️ Troubleshooting
- **Mongo not connecting**: ensure MongoDB service is running; check `MONGO_URI` host/port/db.  
- **Google sign-in fails**: recheck OAuth origins/redirects, client ID/secret, and restart backend after `.env` changes.  
- **Port conflicts**: change `PORT` (backend) or Vite port (`npm run dev -- --port 5174`) and update `FRONTEND_URL` / `VITE_API_URL` accordingly.

---

## 📜 License
This project is owned by **Praveena Kurukuladithya**. Add your preferred license here if publishing publicly.
