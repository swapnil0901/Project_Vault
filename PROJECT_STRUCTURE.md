# ProjectVault Structure

This project is a React + Express application for academic project management.

## Root files

- `index.html`  
  Main HTML file loaded by Vite. It includes the root app container.

- `package.json`  
  Project metadata, scripts, and dependencies. This file controls how the app is started and built.

- `.env`  
  Local environment variables for MongoDB and JWT. Do not commit this file to Git if you are sharing secrets.

- `.env.example`  
  Sample environment file template. Use it to create a safe local `.env` file.

- `.gitignore`  
  Prevents generated files and secrets from being committed.

## Frontend

- `src/main.jsx`  
  Main React application. It contains:
  - app state and routing logic
  - login / register flow
  - project list and task management
  - dashboard pages and role-based UI
  - localStorage-based demo persistence

- `src/styles.css`  
  All visual styling for the ProjectVault interface.

- `src/projectLogic.js`  
  Helper logic for:
  - project progress calculation
  - role navigation
  - approval status
  - project image fallback
  - similarity scoring
  - certificate generation

## Backend

- `server/index.js`  
  Main Express server. It defines:
  - MongoDB models
  - registration and login endpoints
  - JWT auth middleware
  - project, task, and report routes
  - health check and startup logic

- `server/auth.js`  
  Handles password hashing, comparison, and JWT token generation/verification.

- `server/db.js`  
  Connects the backend to MongoDB using `MONGODB_URI` or `DATABASE_URL`.

- `server/reportService.js`  
  Generates text summaries for weekly progress and project status reports.

- `server/resetData.js`  
  Destructive reset utility that clears MongoDB and leaves five projects plus five tasks. Run only with `npm run data:reset` when deleting current data is intentional.

## Generated / non-runtime files

- `dist/`  
  Generated build output from Vite. It is not necessary for development and can be deleted safely.

- `src/projectLogic.test.js`  
  Unit tests for helper logic. Not needed for app runtime.

- `server/reportService.test.js`  
  Unit tests for report generation. Not needed for app runtime.

## How the app works

1. The frontend loads in the browser through Vite.
2. The user signs in or registers from the auth screen.
3. The backend validates credentials using hashed passwords and JWT tokens.
4. Protected routes require a valid bearer token.
5. MongoDB stores users, projects, tasks, and reports.
6. The UI reads and updates project data through the Express API.

## Runtime flow

- Browser UI -> React -> fetch API calls
- Express backend -> validates auth -> queries MongoDB
- Mongoose models -> persist project data
- Report service -> creates summary text files for updates

## Integrations

- OpenAI is called server-side through `/api/ai/project-advice`; keep `OPENAI_API_KEY` out of browser code.
- GitHub metadata is fetched server-side through `/api/github/repository`; public repositories work without a token and `GITHUB_TOKEN` raises rate limits.
- After authentication, projects, tasks, and achievements are hydrated from MongoDB. Local storage is used for session and UI preferences only.
