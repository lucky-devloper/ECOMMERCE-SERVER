const express = require("express");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const router = express.Router();

// Trust proxy
router.use((req, res, next) => {
  req.app.set('trust proxy', 1); // Trust first proxy to ensure HTTPS is recognized
  next();
});


router.post("/signup", async (req, res) => {
  const { username, email, password, avatar, city, nearby, state } = req.body;

  try {
    // Check if the user already exists
    const finduser = await userModel.findOne({ email });
    if (finduser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new userModel({
      username,
      email,
      password: hash,
      avatar,
      address: { city, nearby, state },
    });

    await user.save();

    // Sign JWT and set it as a cookie
    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '24h' });

    // Set cookie with token
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production", // secure in production (https)
      httpOnly: false, // false if you need access to the cookie from frontend JS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site in prod
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(201).json({ message: "User signup successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while signing up", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Sign JWT and set it as a cookie
    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "24h" });

    // Set cookie with token
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production", // secure in production (https)
      httpOnly: false, // false if you need access to the cookie from frontend JS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-site in prod
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: "User logged in successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while logging in", error });
  }
});

module.exports = router;
