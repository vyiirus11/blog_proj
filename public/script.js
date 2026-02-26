//to make the blog interactive

const postsEl = document.getElementById("posts");
const form = document.getElementById("postForm");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const msgEl = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");
const refreshBtn = document.getElementById("refreshBtn");

function setMsg(text, type = "muted") {
  // type: success | danger | muted
  msgEl.className = `small mb-2 text-${type}`;
  msgEl.textContent = text || "";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

function renderPosts(posts) {
  if (!posts?.length) {
    postsEl.innerHTML = `<div class="text-muted">No posts yet. Be the first to post!</div>`;
    return;
  }

  postsEl.innerHTML = posts
    .map(
      (p) => `
      <article class="card shadow-sm">
        <div class="card-body">
          <h3 class="h6 mb-1">${escapeHtml(p.title)}</h3>
          <div class="text-muted small mb-2">${formatDate(p.created_at)}</div>
          <p class="mb-0" style="white-space: pre-wrap;">${escapeHtml(p.body)}</p>
        </div>
      </article>
    `
    )
    .join("");
}

async function loadPosts() {
  setMsg("");
  postsEl.innerHTML = `<div class="text-muted">Loading…</div>`;

  const res = await fetch("/api/posts");
  if (!res.ok) {
    postsEl.innerHTML = "";
    setMsg("Could not load posts.", "danger");
    return;
  }

  const posts = await res.json();
  renderPosts(posts);
}

async function createPost(title, body) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    const maybe = await res.json().catch(() => ({}));
    throw new Error(maybe?.error || "Failed to create post");
  }

  return res.json();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("");

  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();

  if (!title || !body) {
    setMsg("Title and post text are required.", "danger");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Posting…";

  try {
    await createPost(title, body);
    titleEl.value = "";
    bodyEl.value = "";
    setMsg("Posted!", "success");
    await loadPosts();
  } catch (err) {
    setMsg(err.message || "Something went wrong.", "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Post";
  }
});

refreshBtn.addEventListener("click", loadPosts);

// initial load
loadPosts();