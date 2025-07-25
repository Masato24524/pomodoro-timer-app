import { timeStamp } from "console";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).json({
    status: "OK",
    timeStamp: new Date().toISOString(),
    success: true,
  });
});

export default router;
