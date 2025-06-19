import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import "./models/user.model";
import "./models/link.model";
import "./models/clickstat.model";
import authRouter from "./routes/auth.routes";
import linkRouter from "./routes/link.routes";
import statsRouter from "./routes/stats.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT);

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/links", linkRouter);
app.use("/stats", statsRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is up and running");
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
