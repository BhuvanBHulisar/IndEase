import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import db from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.js";
import jobRoutes from "./routes/jobRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import machineRoutes from "./routes/machineRoutes.js";
import { saveMessage } from "./controllers/chatController.js";
import adminRouter, { ensureAdminSchema } from "./routes/admin.js";
import adminNotificationsRoutes from "./routes/notifications.routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import { ensureExpertPerformanceSchema } from "./services/expertPerformanceSchema.js";
import { ensurePaymentSchema } from "./services/paymentSchema.js";
import { startExpertPerformanceCron } from "./services/expertPerformanceService.js";

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...(process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean),
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.set("socketio", io);
global.io = io; // For controllers to access without req object

// 1. GLOBAL MIDDLEWARE
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

// Force COOP: unsafe-none so Google OAuth popup can postMessage back
// Without this, browsers block window.postMessage from accounts.google.com
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    exposedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || "originode_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// 2. ROUTES
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
app.use("/api/analytics", adminRouter);

app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/support", supportRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 3. ERROR HANDLING
app.use(errorHandler);

// 4. REAL-TIME SIGNALS
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    if (socket.data.userId) {
      io.emit("expert_offline", { userId: socket.data.userId });
    }
  });
  socket.on("identify", (userId) => {
    socket.join(`user_${userId}`);
    socket.data.userId = userId;
    console.log(`[Socket] Registered user room: user_${userId}`);
    io.emit("expert_online", { userId });
  });

  socket.on("send_message", async (data) => {
    const { requestId, senderId, text } = data;
    console.log(
      `[Socket] Incoming signal in session ${requestId} from source ${senderId}`,
    );
    const saved = await saveMessage(requestId, senderId, text);
    io.emit("new_message", saved);
  });
});

async function startServer() {
  const PORT = process.env.PORT || 5000;

  // ── Boot the HTTP server immediately so the process never hard-crashes ──────
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[Startup] Port ${PORT} is already in use. Free it with: npx kill-port ${PORT}`,
      );
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`[Startup] HTTP server listening on port ${PORT}`);
    console.log("-----------------------------------");
  });

  // ── Attempt database connection in the background (non-blocking) ────────────
  const MAX_RETRIES = 5;
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      console.log(
        `[DB] Connecting… (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`,
      );
      await db.query("SELECT NOW()");

      // Sequential schema verification
      await ensureAdminSchema();
      await ensureExpertPerformanceSchema();
      await ensurePaymentSchema();
      startExpertPerformanceCron();

      console.log("[DB] Connected and schemas verified ✓");
      return;
    } catch (error) {
      retries--;
      console.error(`[DB] Connection failed: ${error.message}`);

      if (retries === 0) {
        console.error("─────────────────────────────────────────────────────");
        console.error("[DB] Could not reach the database after all attempts.");
        console.error("     The HTTP server is still running on port", PORT);
        console.error("     API routes that need the DB will return 503.");
        console.error("");
        console.error("  Common fixes:");
        console.error("  1. Check DATABASE_URL in server/.env");
        console.error("     • Render free DBs expire after 90 days — create a");
        console.error("       new one at https://neon.tech (free, no expiry)");
        console.error("     • Neon URL format:");
        console.error(
          "       postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require",
        );
        console.error("  2. Make sure ?sslmode=require is appended to the URL");
        console.error("  3. Restart the server after updating .env");
        console.error("─────────────────────────────────────────────────────");
        return; // keep server alive — do NOT call process.exit()
      }

      console.log(`[DB] Retrying in 5 seconds…`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

startServer();
