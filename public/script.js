import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your static files
app.use(express.static(path.join(__dirname, "public")));

// ----- MongoDB (Atlas) -----
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI env var");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

// Simple Post schema
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Post = mongoose.model("Post", postSchema);

// API: get posts
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ created_at: -1 }).lean();
  res.json(posts);
});

// API: create post
app.post("/api/posts", async (req, res) => {
  const { title, body } = req.body || {};
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "title and body required" });
  }

  const created = await Post.create({ title, body });
  res.status(201).json(created);
});

// Render uses process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log("Listening on", port));