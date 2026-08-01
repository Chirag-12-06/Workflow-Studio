const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const api = require("./api");

async function login() {
  await api.post("/auth/login", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });

  console.log("✓ Logged in");
}

module.exports = { login };
