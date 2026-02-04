# 🐄 Moo Music Tracker

A delightful dairy milking session tracker that plays soothing music while you milk your cows. Track milking sessions, record milk quantities, and view your milking history with beautiful statistics.

![Moo Music Tracker](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success)

---

## 🌐 Live Demo

| Service         | URL                                                                                |
| --------------- | ---------------------------------------------------------------------------------- |
| **Frontend**    | [https://moo-music-tracker.hearu.fun](https://moo-music-tracker.hearu.fun)         |
| **Backend API** | [https://api.moo-music-tracker.hearu.fun](https://api.moo-music-tracker.hearu.fun) |
| **CloudFront**  | [https://d2kqgenprqm3vi.cloudfront.net](https://d2kqgenprqm3vi.cloudfront.net)     |

---

## 📦 Postman Collection

Import the Postman collection to test all API endpoints:

**[📥 Download Postman Collection](./backend/POSTMAN_COLLECTION.json)**

Or import directly using this URL:

```
https://github.com/imankii01/animal/blob/main/backend/POSTMAN_COLLECTION.json
```

### API Endpoints

| Method   | Endpoint            | Description              |
| -------- | ------------------- | ------------------------ |
| `GET`    | `/api/sessions`     | Get all milking sessions |
| `GET`    | `/api/sessions/:id` | Get a specific session   |
| `POST`   | `/api/sessions`     | Create a new session     |
| `PUT`    | `/api/sessions/:id` | Update a session         |
| `DELETE` | `/api/sessions/:id` | Delete a session         |
| `GET`    | `/health`           | Health check endpoint    |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** (comes with Node.js)
- **MongoDB** (local or Atlas)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/imankii01/animal.git
cd animal
```

---

## 🖥️ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Frontend Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB connection string
# MONGODB_URI=mongodb+srv://your-connection-string
# PORT=5000
# NODE_ENV=development

# Start development server
npm run dev

# Or start production server
npm start
```

The backend will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moo-music-tracker
FRONTEND_URL=http://localhost:5173
```

---

## 🏗️ Project Structure

```
animal/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API client
│   │   └── App.tsx           # Main app component
│   ├── public/               # Static assets
│   └── package.json
│
├── backend/                  # Node.js + Express backend
│   ├── config/               # Database configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── server.js             # Entry point
│   └── package.json
│
└── README.md                 # This file
```

---

## 🎵 Features

- ⏱️ **Timer**: Track milking session duration with start/pause/stop controls
- 🎶 **Music Player**: Plays random soothing music during milking sessions
- 📊 **Statistics**: View total milk collected, average per session, and session count
- 📅 **History**: Browse all past milking sessions with detailed information
- 🐄 **Animations**: Delightful cow animations powered by Framer Motion
- 📱 **Responsive**: Works on desktop and mobile devices

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **React Router** - Routing

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **PM2** - Process manager (production)

### Infrastructure

- **AWS S3** - Frontend hosting
- **AWS CloudFront** - CDN
- **AWS EC2** - Backend hosting
- **AWS Route53** - DNS
- **AWS ACM** - SSL certificates

---

## 🚢 Deployment

### Frontend Deployment (S3 + CloudFront)

```bash
cd frontend

# Build the project
npm run build

# Sync to S3
aws s3 sync dist/ s3://moo-music-tracker-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1J492E58JF4OY --paths "/*"
```

### Backend Deployment (EC2 + PM2)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@3.27.212.101

# Navigate to backend
cd /home/ubuntu/backend

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart PM2
pm2 restart ecosystem.config.js --env production
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### Backend API Testing

```bash
cd backend
./test-api.sh
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ankit Singh**

---

## 🙏 Acknowledgments

- Music tracks from royalty-free sources
- Cow icon and animations
- shadcn/ui for beautiful components

# animal
