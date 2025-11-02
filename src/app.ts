import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { requestLogger } from "./middlewares/requestLogger";
import router from "./routes/index";
import logger from "./utils/logger";

const app: Application = express();

// -- Middlewares --
// Cross-Origin Resource Sharing
app.use(cors());
// Secure HTTP Headers
app.use(helmet());
// Parse JSON req.body
app.use(express.json());
// Parse URL-encodes req.body
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use(requestLogger);

// -- Routes --
// Home Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is Running",
  });
});

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/v1", router);

// Not Found Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// Error Handler
app.use((err: Error, req: Request, res: Response) => {
  logger.error(`[Error] ${err.message}, Stack: ${err.stack}`);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

export default app;
