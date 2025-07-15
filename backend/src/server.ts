import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
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

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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
