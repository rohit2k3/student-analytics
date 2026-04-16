const app = require("./app");
const { connectDb } = require("./config/db");
const env = require("./config/env");

async function bootstrap() {
  try {
    await connectDb();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

bootstrap();
