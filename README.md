# ProjectVault

## Setup

### 1. Create the Atlas database

1. Open MongoDB Atlas and create a free shared cluster.
2. In **Database Access**, create a database user and save its username and password.
3. In **Network Access**, add your current IP address. Use `0.0.0.0/0` only for temporary local testing.
4. Open **Connect > Drivers**, choose Node.js, and copy the connection string.

### 2. Configure the project

1. Copy `.env.example` to `.env`.
2. Replace the placeholders in `MONGODB_URI` with the Atlas user password and cluster host. Keep `/projectvault` in the URI so the application uses the intended database.
3. Set a long random value for `JWT_SECRET`.
4. If the database password contains characters such as `@`, `:`, `/`, or `#`, URL-encode it before placing it in the URI.

Example format:

```env
MONGODB_URI=mongodb+srv://<database-user>:<url-encoded-password>@<cluster-host>/projectvault?retryWrites=true&w=majority&appName=ProjectVault
PORT=5000
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
JWT_SECRET=replace-with-a-long-random-secret
```

### 3. Install and verify locally

```bash
npm install
npm run server
```

The backend should print `MongoDB connected successfully` and then listen on `http://localhost:5000`.

In a second terminal:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
npm run dev
```

The health response should contain `status: "ok"`. Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

### 4. Deploy to Vercel

The repository includes `api/[...path].js`, which exposes the Express API as a Vercel serverless function. In the Vercel project settings, open **Settings > Environment Variables** and add these for **Production**, **Preview**, and **Development** as needed:

```env
MONGODB_URI=mongodb+srv://<database-user>:<url-encoded-password>@<cluster-host>/projectvault?retryWrites=true&w=majority&appName=ProjectVault
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://project-vault-nbnscoe.vercel.app
```

Do not set `VITE_API_URL` for this same-origin deployment. The frontend will call `/api` on the deployed site. If the API is hosted separately, set `VITE_API_URL` to the public API URL and set `CLIENT_URL` to the frontend URL.

Then deploy from the project root:

```powershell
vercel login
vercel --prod
```

After deployment, open `https://project-vault-nbnscoe.vercel.app/api/health`. It must return `status: "ok"` and `database: "connected"`. If it returns `503`, check `MONGODB_URI` and allow the deployment to connect in MongoDB Atlas **Network Access**. If it returns `404`, the latest source has not been deployed yet.

### 5. Confirm data in Atlas

Register a test account or create a project through the API. Then open Atlas **Browse Collections**. The `projectvault` database will contain collections such as `users`, `projects`, `tasks`, and `reports` after the first records are created.

The authenticated frontend hydrates projects, tasks, and achievements from the Express/Mongoose API. Local storage remains only for session, preferences, and small UI-only drafts.

To remove the existing MongoDB records and keep only five starter projects and five starter tasks, review your `.env` and run:

```powershell
npm run data:reset
```

This command is destructive and should not be run against a production database.

## Features

- Role-based auth for student, mentor, and HOD
- Project portfolio and project creation
- Task completion with proof submission
- Weekly report generation and display
- MongoDB-ready backend for persistence
- Downloadable Word-compatible weekly reports
- Server-side optional OpenAI project advice and GitHub repository metadata
