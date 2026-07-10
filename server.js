import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";

import spacesRouter from "./routes/spaces.js";
import reviewsRouter from "./routes/reviews.js";
import mentorsRouter from "./routes/mentors.js";
import analyticsRouter from "./routes/analytics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend later
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/api/spaces", spacesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/mentors", mentorsRouter);
app.use("/api/analytics", analyticsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));