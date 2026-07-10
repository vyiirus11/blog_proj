import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend later
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/api/spaces", require("./routes/spaces"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/mentors", require("./routes/mentors"));
app.use("/api/analytics", require("./routes/analytics"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));