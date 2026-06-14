# Orufy Assignment Build

This repo contains the requested full-stack assignment implementation using:

- `client/`: React + Vite frontend
- `server/`: Node.js + Express + Mongoose backend
- MongoDB via `MONGODB_URI`, with an automatic in-memory Mongo fallback for local demos

## Features

- OTP-based login flow with login, OTP, success, and error states
- Home dashboard with `Published` and `Unpublished` tabs
- Product listing, search, publish/unpublish, edit, and delete
- Add product modal with image uploads
- Seeded sample products to make the UI meaningful on first run

## Run Locally

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment variables

Create a root `.env` file if you want to use a real MongoDB database:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/orufy
```

If `MONGODB_URI` is omitted, the server will start with `mongodb-memory-server` so the app still runs locally for review.

### 3. Start the full app

From the project root:

```bash
npm run dev
```

This starts:

- frontend on [http://localhost:5173](http://localhost:5173)
- backend on [http://localhost:4000](http://localhost:4000)

### 4. Run the frontend only

```bash
cd client
npm run dev
```

This starts the frontend on [http://localhost:5173](http://localhost:5173).

### 5. Run the backend only

```bash
cd server
npm run dev
```

This starts the backend on [http://localhost:4000](http://localhost:4000).

### 6. Required environment variables

The backend reads these values from the root `.env` file:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/orufy
```

- `PORT`: the backend server port
- `CLIENT_ORIGIN`: the frontend URL allowed by CORS
- `MONGODB_URI`: the MongoDB connection string

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
