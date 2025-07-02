import dotenv from "dotenv";
dotenv.config();

import express from "express";
import entriesRouter from "./routes/entries";
import timerRoutingRouter from "./routes/timer-routing";

const app = express();
const PORT = 3001;

app.use(express.json());

app.use("/api/entries", entriesRouter);
app.use("/api/timer-routing", timerRoutingRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
