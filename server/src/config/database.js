const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { env } = require("./env");

let memoryServer;

async function connectDatabase() {
  let connectionUri = env.mongoUri;

  if (!connectionUri) {
    memoryServer = await MongoMemoryServer.create();
    connectionUri = memoryServer.getUri();
    console.log("No MONGODB_URI found. Using in-memory MongoDB for local development.");
  }

  await mongoose.connect(connectionUri);
}

async function disconnectDatabase() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}

module.exports = { connectDatabase, disconnectDatabase };
