import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import entriesRouter from "./routes/entries";
import timerRoutingRouter from "./routes/timer-routing";
import authRouter from "./routes/auth";

const app = express();
const PORT = 3001;
app.use(express.json());

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://pomodoro-timer-app-vx57.onrender.com"]
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200, // IE11対応
  maxAge: 86400, // プリフライトキャッシュ時間（24時間）
};

app.use(cors(corsOptions));

app.use("/api/health", healthRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/timer-routing", timerRoutingRouter);

app.use((req, res, next) => {
  if (req.path.includes("/auth")) {
    console.log(`🎯 AUTH関連リクエスト: ${req.method} ${req.path}`);
    console.log("📋 Body:", req.body);
    console.log("📋 Headers:", req.headers);
  }
  next();
});

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
