const path = require("node:path");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { env } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (
        !origin ||
        origin === env.clientOrigin ||
        origin === "http://127.0.0.1:5173" ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/media-assets", express.static(path.resolve(__dirname, "../public/assets")));

app.get("/api/health", (req, res) => {
  res.json({ message: "API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
