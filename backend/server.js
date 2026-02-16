const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "messages.db");
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Eksik bilgi");
  }

  db.run(
    `INSERT INTO messages (name, email, message) VALUES (?, ?, ?)`,
    [name, email, message],
    function (err) {
      if (err) {
        console.error("DB insert hata:", err);
        return res.status(500).send("DB'ye kaydedilemedi");
      }
      console.log("DB’ye kaydedildi. ID:", this.lastID);
      res.json({ ok: true, id: this.lastID });
    }
  );
});

app.get("/api/messages", (req, res) => {
  db.all(
    `SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC`,
    (err, rows) => {
      if (err) {
        console.error("DB select hata:", err);
        return res.status(500).send("Mesajlar okunamadı");
      }
      res.json(rows);
    }
  );
});

app.listen(3000, () => {
  console.log("Server çalışıyor → http://localhost:3000");
  console.log("Mesajları gör: http://localhost:3000/api/messages");
});
