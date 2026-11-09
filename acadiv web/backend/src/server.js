const { loadEnv } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  let env;
  try {
    env = loadEnv();
  } catch (err) {
    console.error(`[fatal] ${err.message}`);
    process.exit(1);
  }

  try {
    await connectDB(env.mongodbUri);
  } catch (err) {
    console.error(`[fatal] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[acadiv] API listening on http://localhost:${env.port}`);
    console.log(`[acadiv] Health: GET /api/v1/health  Ready: GET /api/v1/ready`);
  });

  const shutdown = async (signal) => {
    console.log(`[acadiv] ${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
