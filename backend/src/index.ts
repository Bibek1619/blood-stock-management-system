import express from "express";
import cors from "cors";
import { prisma } from "../lib/prisma";
import routes from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      message: "Blood Donation API is running",
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      message: "Database connection failed",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.use("/api", routes);
app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
