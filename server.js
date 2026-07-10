import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// ----- MongoDB (Atlas) -----
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI env var");
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");
} catch (err) {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
}

// Schema
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Post = mongoose.model("Post", postSchema);

// API
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ created_at: -1 }).lean();
  res.json(posts);
});

app.post("/api/posts", async (req, res) => {
  const { title, body } = req.body || {};
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "title and body required" });
  }

  const created = await Post.create({ title: title.trim(), body: body.trim() });
  res.status(201).json(created.toObject());
});

// Render uses process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log("Listening on", port));

console.log("URI starts with:", MONGODB_URI.slice(0, 20), "... length:", MONGODB_URI.length);