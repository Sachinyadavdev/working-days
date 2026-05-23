# Employee Management System - Run Guide

To run the project, you have two primary options depending on whether you want to simulate a production environment or run it locally for development.

## Option 1: Development Mode (Recommended for Coding)

This will spin up the database and cache in Docker, but run the frontend and backend natively on your machine so you get hot-reloading when you make code changes.

1. **Start the Database & Redis** using Docker Compose:
   ```bash
   docker-compose up -d db redis
   ```

2. **Setup your Environment Variables**:
   Navigate to `apps/api/` and copy the `.env.example` file to `.env` (the database URL will point to `localhost:5432` by default which matches the local Docker container).

3. **Initialize the Database**:
   Push the Prisma schema to the database and (optionally) run the seed script to populate default roles and an admin user.
   ```bash
   pnpm --filter=@ems/api run db:push
   pnpm --filter=@ems/api run db:seed
   ```

4. **Start the Monorepo**:
   Run the following command from the root folder. Turborepo will start both the NestJS API and the Next.js Frontend in parallel:
   ```bash
   pnpm run dev
   ```

**URLs for Dev Mode:**
- Frontend Web App: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Swagger Docs: http://localhost:3001/api/docs

---

## Option 2: Production Simulation (Full Docker)

This mode builds the production-ready optimized Docker images for the frontend and backend, and routes everything through an Nginx proxy. Use this when you want to test how the app runs in production.

1. Ensure Docker Desktop is running.
2. From the root directory, simply run:
   ```bash
   docker-compose up -d --build
   ```
3. Once the build is finished and the containers are running, Nginx will route your traffic automatically.

**URLs for Prod Simulation:**
- Frontend Web App: http://localhost
- Backend API: http://localhost/api/
- WebSockets: `ws://localhost/socket.io/`


You can log in to the frontend using the seeded admin credentials: Email: admin@ems.com Password: Admin@123  

**Graphify - Commands **
- **Build Docker Image:docker build -t graphify .**
"First run graphify query" before I blindly start searching through your files for architecture or codebase questions.
"Run graphify update ." after I modify code files in our session so that the graph stays perfectly synchronized with our changes.

NOTE

Since we added new tables and columns, you should run pnpm prisma db push --accept-data-loss (or a migrate dev command) if you deploy this to other environments to synchronize their databases.

pnpm --filter @ems/api run db:seed
