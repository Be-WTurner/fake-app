const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory todo store
let todos = [
  { id: 1, text: "Set up GitHub Actions workflow", done: false },
  { id: 2, text: "Configure build pipeline", done: false },
  { id: 3, text: "Take screenshots with Playwright", done: false },
];
let nextId = 4;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CSS (inline — no static file dependency) ─────────────────────────────────

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0f0f0f;
  --surface: #1a1a1a;
  --border:  #2a2a2a;
  --text:    #e8e8e8;
  --muted:   #666;
  --accent:  #7fff9a;
  --danger:  #ff6b6b;
  --font:    "JetBrains Mono", "Fira Mono", "Cascadia Code", ui-monospace, monospace;
  --radius:  4px;
}

html { font-size: 15px; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}

.wordmark {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--accent);
  text-transform: lowercase;
  flex-shrink: 0;
}

nav { display: flex; gap: 1.5rem; }

nav a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  transition: color 0.15s;
}

nav a:hover { color: var(--text); }
nav a.active { color: var(--accent); }

main {
  flex: 1;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
}

h1 {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text);
}

.subtitle {
  color: var(--muted);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.badge {
  font-size: 0.75rem;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
  letter-spacing: 0.04em;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.add-form input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font);
  font-size: 0.875rem;
  padding: 0.55rem 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}

.add-form input:focus { border-color: var(--accent); }
.add-form input::placeholder { color: var(--muted); }

.add-form button {
  background: var(--accent);
  color: #0f0f0f;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.add-form button:hover { opacity: 0.85; }

.todo-list {
  list-style: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

.todo-item:last-child { border-bottom: none; }
.todo-item:hover { background: var(--surface); }

.todo-item.done .todo-text {
  text-decoration: line-through;
  color: var(--muted);
}

.todo-text { flex: 1; font-size: 0.875rem; }

.empty {
  padding: 1.5rem 1rem;
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}

.inline { display: flex; align-items: center; }

.check, .del {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  font-size: 1rem;
  line-height: 1;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  transition: color 0.15s;
}

.check { color: var(--muted); }
.check:hover { color: var(--accent); }
.del { color: var(--border); }
.del:hover { color: var(--danger); }

.clear-form { margin-top: 1rem; }

.link-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-family: var(--font);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  padding: 0;
  text-decoration: underline;
  transition: color 0.15s;
}

.link-btn:hover { color: var(--danger); }

.page-section h1 { margin-bottom: 0.5rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 2rem 0;
}

.stat {
  background: var(--surface);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-num {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-block {
  border-left: 2px solid var(--border);
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.contact-grid {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 2rem 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.contact-item:last-child { border-bottom: none; }
.contact-item:hover { background: var(--surface); }

.contact-item .label {
  color: var(--muted);
  min-width: 80px;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

footer {
  padding: 1rem 2rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

@media (max-width: 480px) {
  header { padding: 1rem; }
  main { padding: 2rem 1rem; }
}
`;

// ── Layout helpers ────────────────────────────────────────────────────────────

const nav = (active) => `
<nav>
  <a href="/" class="${active === "home" ? "active" : ""}">Tasks</a>
  <a href="/stuff" class="${active === "stuff" ? "active" : ""}">Stuff</a>
  <a href="/contact" class="${active === "contact" ? "active" : ""}">Contact</a>
</nav>`;

const shell = (title, active, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — todo</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <span class="wordmark">todo</span>
    ${nav(active)}
  </header>
  <main>${body}</main>
  <footer>
    <span>todo app · built for ci/cd experiments</span>
  </footer>
</body>
</html>`;

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  const items = todos.map((t) => `
    <li class="todo-item${t.done ? " done" : ""}">
      <form method="POST" action="/toggle/${t.id}" class="inline">
        <button type="submit" class="check" title="Toggle">${t.done ? "✓" : "○"}</button>
      </form>
      <span class="todo-text">${escHtml(t.text)}</span>
      <form method="POST" action="/delete/${t.id}" class="inline">
        <button type="submit" class="del" title="Delete">×</button>
      </form>
    </li>`).join("");

  const remaining = todos.filter((t) => !t.done).length;

  res.send(shell("Tasks", "home", `
    <section class="todo-section">
      <div class="todo-header">
        <h1>Tasks</h1>
        <span class="badge">${remaining} left</span>
      </div>
      <form method="POST" action="/add" class="add-form">
        <input type="text" name="text" placeholder="Add a task…" autocomplete="off" required />
        <button type="submit">Add</button>
      </form>
      <ul class="todo-list">
        ${items || '<li class="empty">No tasks yet. Add one above.</li>'}
      </ul>
      ${todos.some((t) => t.done)
        ? `<form method="POST" action="/clear-done" class="clear-form">
             <button type="submit" class="link-btn">Clear completed</button>
           </form>`
        : ""}
    </section>`));
});

app.post("/add", (req, res) => {
  const text = (req.body.text || "").trim();
  if (text) todos.push({ id: nextId++, text, done: false });
  res.redirect("/");
});

app.post("/toggle/:id", (req, res) => {
  const t = todos.find((x) => x.id === Number(req.params.id));
  if (t) t.done = !t.done;
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  todos = todos.filter((x) => x.id !== Number(req.params.id));
  res.redirect("/");
});

app.post("/clear-done", (req, res) => {
  todos = todos.filter((t) => !t.done);
  res.redirect("/");
});

app.get("/stuff", (req, res) => {
  const stats = {
    total: todos.length,
    done: todos.filter((t) => t.done).length,
    open: todos.filter((t) => !t.done).length,
  };

  res.send(shell("Stuff", "stuff", `
    <section class="page-section">
      <h1>Stuff</h1>
      <p class="subtitle">A placeholder page for your GitHub Actions experiments.</p>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-num">${stats.total}</span>
          <span class="stat-label">total tasks</span>
        </div>
        <div class="stat">
          <span class="stat-num">${stats.open}</span>
          <span class="stat-label">open</span>
        </div>
        <div class="stat">
          <span class="stat-num">${stats.done}</span>
          <span class="stat-label">done</span>
        </div>
      </div>
      <div class="info-block">
        <p>This page exists so your workflow has multiple routes to screenshot.</p>
        <p>Stack: Node.js · Express · zero frontend dependencies.</p>
      </div>
    </section>`));
});

app.get("/contact", (req, res) => {
  res.send(shell("Contact", "contact", `
    <section class="page-section">
      <h1>Contact</h1>
      <p class="subtitle">Another page for your CI/CD screenshot runs.</p>
      <div class="contact-grid">
        <div class="contact-item">
          <span class="label">Project</span>
          <span>todo-app</span>
        </div>
        <div class="contact-item">
          <span class="label">Runtime</span>
          <span>Node.js ${process.version}</span>
        </div>
        <div class="contact-item">
          <span class="label">Port</span>
          <span>${PORT}</span>
        </div>
        <div class="contact-item">
          <span class="label">Uptime</span>
          <span id="uptime">—</span>
        </div>
      </div>
    </section>
    <script>
      const start = Date.now();
      setInterval(() => {
        document.getElementById('uptime').textContent =
          Math.floor((Date.now() - start) / 1000) + 's';
      }, 1000);
    </script>`));
});

// ── Util ──────────────────────────────────────────────────────────────────────

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`todo app running at http://localhost:${PORT}`);
});