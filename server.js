import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
init().catch(console.error);

app.get("/api/posts", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, title, body, created_at FROM posts ORDER BY created_at DESC"
  );
  res.json(rows);
});

app.post("/api/posts", async (req, res) => {
  const { title, body } = req.body || {};
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "title and body required" });
  }

  const { rows } = await pool.query(
    "INSERT INTO posts (title, body) VALUES ($1, $2) RETURNING id, title, body, created_at",
    [title.trim(), body.trim()]
  );
  res.status(201).json(rows[0]);
});

// For SPA-like setups, optional fallback:
// app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log("Listening on", port));