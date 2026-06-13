const app = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { env } = require("./config/env");
const { seedDatabase } = require("./utils/seed");

async function bootstrap() {
  await connectDatabase();
  await seedDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
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
