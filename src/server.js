require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const { Pool } = require("pg");
const admin = require("firebase-admin");

// --------------------------------------------------
// 🔐 Firebase Admin Initialization
// --------------------------------------------------

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

// --------------------------------------------------
// 🟢 Neon PostgreSQL
// --------------------------------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// --------------------------------------------------
// 🪵 Logger Setup (Structured)
// --------------------------------------------------

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// --------------------------------------------------
// 🚀 Express App
// --------------------------------------------------

const app = express();

// Security Headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// JSON Parser
app.use(express.json({ limit: "10mb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// --------------------------------------------------
// 🔐 Firebase Token Middleware
// --------------------------------------------------

async function verifyFirebase(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Token verification failed", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// --------------------------------------------------
// 📊 Request Logging Middleware
// --------------------------------------------------

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  next();
});

// --------------------------------------------------
// 🩺 Health Check Route
// --------------------------------------------------

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "database error" });
  }
});

// --------------------------------------------------
// 🔥 Routes
// --------------------------------------------------

app.use("/api/auth", require("./api/auth"));
app.use("/api/users", verifyFirebase, require("./api/users"));
app.use("/api/leaderboard", require("./api/leaderboard"));
app.use("/api/scores", verifyFirebase, require("./api/scores"));

// --------------------------------------------------
// ❌ 404 Handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --------------------------------------------------
// 🌍 Global Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// --------------------------------------------------
// 🛑 Graceful Shutdown
// --------------------------------------------------

process.on("SIGTERM", async () => {
  logger.info("Shutting down server...");
  await pool.end();
  process.exit(0);
});

// --------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  logger.info(`🚀 Server running on port ${PORT}`)
);
