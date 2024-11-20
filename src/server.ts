import { createServer } from "node:http";
import { Server } from "socket.io";
import { config } from "./config/config";
import { Redis } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import app from "./app";
import logger from "./config/winston";

const server = createServer(app);
const io = new Server(server);

const redis = new Redis(config.REDIS_CONNECTION_STRING, {
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 5,
  tls: {
    rejectUnauthorized: false,
  },
});
const pubClient = redis.duplicate();
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

redis.on("error", (err) => {
  logger.error(`Error in Redis client: ${err}`);
});

io.on("connection", (socket) => {
  logger.info(`socket ID of ${socket.id} connected`);
  socket.on("register", (userId) => {
    pubClient.set(`socket:${userId}`, socket.id, "EX", 300);
    logger.info({
      message: `User registered with socket ID ${socket.id}`,
      userId: userId,
    });
  });

  socket.on("disconnect", () => {
    logger.info(`Socket ID of ${socket.id} disconnected`);
  });
});

function startServer() {
  server.listen(config.PORT, () => {
    logger.info(`Server has started on port: ${config.PORT}`);
  });

  process.on("uncaughtException", async (err) => {
    logger.error(`Uncaught exception: ${err}`);
    process.exit(1);
  });

  process.on("unhandledRejection", async (err) => {
    logger.error(`Uncaught rejection: ${err}`);
    process.exit(1);
  });
}

export { io, redis, startServer };
