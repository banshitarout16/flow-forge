# FlowForge

FlowForge is a configurable workflow and operations management platform that can be adapted to any industry or organization. Organizations can configure the platform based on their specific requirements by providing the necessary business details, workflows, teams, roles, and operational rules.

The platform provides secure authentication and role-based access, allowing organizations to manage users and their access according to their responsibilities.

## Features

- Organization and user management
- Role-based access control
- Work item and request management
- Configurable workflows
- Team management
- SLA policies and monitoring
- Automation rules
- File attachments
- Real-time updates and notifications
- Dashboard and analytics
- Multi-organization data isolation

## Tech Stack

- Frontend: React, Vite, Material UI, Axios, React Router, Socket.IO Client
- Backend: Node.js, Express.js, MongoDB - Mongoose, Socket.IO, JWT Authentication, Node Cron
- Services & deployment: MongoDB Atlas, Cloudinary, vercel+Render

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd FlowForge
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a environment file in the `backend` folder with its credentials:

```env
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

```text
http://localhost:5173
```
