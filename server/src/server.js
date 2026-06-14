const app = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { env } = require("./config/env");
const { seedDatabase } = require("./utils/seed");

async function bootstrap() {
  console.log(`Bootstrapping server in ${env.nodeEnv} mode on port ${env.port}...`);
  await connectDatabase();
  await seedDatabase();

  const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
