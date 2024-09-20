const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


// Trust proxy
router.use((req, res, next) => {
  req.app.set('trust proxy', 1); // Trust first proxy to ensure HTTPS is recognized
  next();
});

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password, avatar, city, nearby, state } = req.body;

  try {
    const finduser = await userModel.findOne({ email });
    if (finduser) {
      return res.status(500).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new userModel({ username, email, password: hash, avatar, address: { city, nearby, state } });

    await user.save();
    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '24h' });

    // Set cookie
    res.cookie("token", token, {
      secure: true, // Ensure it's set to true in production (Railway should use HTTPS)
      httpOnly: false, // Accessible from frontend for now
      sameSite: "none", // Required for cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: "User signup successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while signing up", error });
  }
});

module.exports = router;
