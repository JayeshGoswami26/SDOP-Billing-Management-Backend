import http from "http";
import app from "./app.js";
import config from "./config/index.js";
import { connectDB } from "./config/db.js";
import { Server as SocketIOServer } from "socket.io";
import logger from "./utils/logger.js";


const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    logger.info("Socket disconnected:", socket.id);
  });
});

async function start() {
  try {
    await connectDB().then(() => {
      logger.info("MongoDB connected");
    }).catch((err) => {
      logger.error("MongoDB connection error:", err);
    }).then(() => {
      server.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
      });
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
