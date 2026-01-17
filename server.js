const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = path.join(__dirname, "users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// SIGNUP
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = {
    userID: "u_" + Date.now(),
    username,
    email,
    password
  };

  users.push(user);
  writeUsers(users);

  res.json({ userID: user.userID });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ userID: user.userID });
});

// AUTO LOGIN
app.get("/user/:id", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.userID === req.params.id);

  if (!user) return res.status(404).json({ error: "Not found" });

  res.json(user);
});

app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
