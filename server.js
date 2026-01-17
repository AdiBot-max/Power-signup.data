const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(express.static("public"));

/* ---------------- FILE PATH ---------------- */
const USERS_FILE = path.join(__dirname, "users.json");

/* ---------------- HELPERS ---------------- */
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, "[]");
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch (err) {
    console.error("READ ERROR:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("WRITE ERROR:", err);
  }
}

/* ---------------- SIGNUP ---------------- */
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    userID: "u_" + Date.now(),
    username,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  writeUsers(users);

  console.log("USER CREATED:", newUser.userID);

  res.json({ userID: newUser.userID });
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  console.log("USER LOGIN:", user.userID);

  res.json({ userID: user.userID });
});

/* ---------------- AUTO LOGIN ---------------- */
app.get("/user/:id", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.userID === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    userID: user.userID,
    username: user.username,
    email: user.email
  });
});

/* ---------------- DEBUG (IMPORTANT) ---------------- */
/*
  OPEN THIS IN BROWSER:
  https://your-render-url/_debug/users

  This shows users.json AS IT EXISTS ON RENDER
  (NOT GitHub)
*/
app.get("/_debug/users", (req, res) => {
  res.json(readUsers());
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
