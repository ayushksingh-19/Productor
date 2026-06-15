const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

function parseOrigins(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const env = {
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGINS, [
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
    "https://productor-nu.vercel.app",
  ]),
  mongoUri: process.env.MONGODB_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
};

module.exports = { env };
