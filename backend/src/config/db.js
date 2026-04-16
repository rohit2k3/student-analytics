const mongoose = require("mongoose");
const dns = require("dns");
const env = require("./env");

let connectionPromise = null;

function isConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectDb() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  if (isConnected()) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      await mongoose.connect(env.mongodbUri);
      // eslint-disable-next-line no-console
      console.log("MongoDB connected");
      return mongoose.connection;
    } catch (error) {
      const isSrvDnsRefused =
        error?.code === "ECONNREFUSED" && error?.syscall === "querySrv";

      if (!isSrvDnsRefused) {
        throw error;
      }

      const fallbackDnsServers =
        env.dnsServers.length > 0 ? env.dnsServers : ["8.8.8.8", "1.1.1.1"];
      dns.setServers(fallbackDnsServers);

      // Retry once after forcing resolvers; some local routers reject SRV DNS for Node.
      await mongoose.connect(env.mongodbUri);
      // eslint-disable-next-line no-console
      console.log(
        `MongoDB connected (using DNS servers: ${fallbackDnsServers.join(", ")})`
      );
      return mongoose.connection;
    }
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

async function ensureDbConnected(req, res, next) {
  try {
    await connectDb();
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  connectDb,
  ensureDbConnected,
};
