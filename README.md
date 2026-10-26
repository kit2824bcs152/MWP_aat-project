# College Course Management System

A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) for managing college courses, student enrollments, faculty assignments, and real-time dashboard analytics.

## 🚀 Features

- **Dashboard**: Real-time summary statistics, enrollment trends, and department breakdowns.
- **Course Management**: Add, update, view, and manage courses, credits, departments, and prerequisites.
- **Student Management**: Student directory with enrolled course tracking.
- **Faculty Management**: Manage instructors and assign courses.
- **Enrollments**: Process and manage course enrollments with status updates.

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 + Vite
  - Tailwind CSS
  - Lucide React (Icons)
  - Recharts (Analytics Charts)
  - Axios (API communication)
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose
  - Morgan (HTTP request logger)
  - CORS & Dotenv

## 📂 Project Structure

```text
MWP project/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers & business logic
│   ├── middleware/      # Error handler & validation middleware
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API route definitions
│   ├── seed.js          # Database seeder script
│   ├── server.js        # Express application entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static assets
│   ├── src/             # React application source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard & management pages
│   │   ├── services/    # API client services
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
```

Configure your environment variables:
Create a `.env` file in the `backend/` directory (refer to `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college_course_db
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Optional: Seed initial demo data:
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
# or: node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and communicate with the backend at `http://localhost:5000`.

## 📄 License
This project is open-source and available under the MIT License.
