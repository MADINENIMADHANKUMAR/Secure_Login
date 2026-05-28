const express = require("express");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const router = express.Router();

const User = require("../models/User");

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {

  const { username, email, password } = req.body;

  // Input Validation
  if (!username || !email || !password) {
    return res.send("All fields required");
  }

  if (!validator.isEmail(email)) {
    return res.send("Invalid Email");
  }

  if (password.length < 6) {
    return res.send("Password must be 6+ chars");
  }

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.send("User already exists");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword
  });

  await user.save();

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.send("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.send("Invalid credentials");
  }

  // Session Creation
  req.session.userId = user._id;

  res.redirect("/dashboard");
});

router.get("/dashboard", (req, res) => {

  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.render("dashboard");
});

router.get("/logout", (req, res) => {

  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;