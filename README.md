# Orufy Assignment Build

This repository contains the full-stack assignment build using React, Vite, Node.js, Express, MongoDB, and Mongoose.

## Live Project Links

- Live frontend: [https://productor-nu.vercel.app/](https://productor-nu.vercel.app/)
- Live backend API: [https://productor-api.onrender.com](https://productor-api.onrender.com)
- GitHub repository: [https://github.com/ayushksingh-19/Productor](https://github.com/ayushksingh-19/Productor)

## Deployment & Submission

- Host the project on GitHub:
  [https://github.com/ayushksingh-19/Productor](https://github.com/ayushksingh-19/Productor)
- The repository includes:
  - Clear folder structure with `client/` and `server/`
  - Setup instructions in `README.md`
  - Frontend run steps
  - Backend run steps
  - Required environment variables such as `MONGODB_URI`

## Project Overview

- `client/`: React + Vite frontend
- `server/`: Node.js + Express + Mongoose backend
- MongoDB via `MONGODB_URI`, with an automatic in-memory Mongo fallback for local demos

## Features

- OTP-based login flow with login, OTP, success, and error states
- Home dashboard with `Published` and `Unpublished` tabs
- Product listing, search, publish, unpublish, edit, and delete
- Add product modal with image uploads
- Seeded sample products to make the UI meaningful on first run

## Setup Instructions

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Required environment variables

Create a root `.env` file:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173,https://productor-nu.vercel.app
MONGODB_URI=mongodb://127.0.0.1:27017/orufy
```

Environment variable notes:

- `PORT`: backend server port
- `CLIENT_ORIGIN`: primary frontend URL allowed by CORS
- `CLIENT_ORIGINS`: comma-separated list of additional frontend URLs allowed by CORS
- `MONGODB_URI`: MongoDB connection string

If `MONGODB_URI` is omitted, the server falls back to `mongodb-memory-server` so the project can still run locally for review.

### 3. Run the full project

From the project root:

```bash
npm run dev
```

This starts:

- frontend on [http://localhost:5173](http://localhost:5173)
- backend on [http://localhost:4000](http://localhost:4000)

### 4. How to run the frontend

```bash
cd client
npm run dev
```

This starts the frontend on [http://localhost:5173](http://localhost:5173).

### 5. How to run the backend

```bash
cd server
npm run dev
```

This starts the backend on [http://localhost:4000](http://localhost:4000).

## Demo Notes

- The auth flow uses a demo OTP returned by the backend because there is no SMS or email provider wired in this assignment build.
- The UI shows the current demo OTP so the reviewer can continue through the flow easily.
- Uploaded product images are stored in `server/uploads/`.

## API Overview

### Auth

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`

### Products

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:productId`
- `PATCH /api/products/:productId/status`
- `DELETE /api/products/:productId`

## Suggested Production Follow-Ups

- Replace demo OTP with a real SMS/email provider
- Add authentication tokens and protected routes on the backend
- Move uploaded media to cloud storage
- Add pagination and richer product filtering
