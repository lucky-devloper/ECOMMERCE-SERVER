const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")

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

    // Set the cookie
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production" ? true : false, // Disable secure flag for testing in non-production
      httpOnly: false, // Accessible from frontend for development (set to true in production if needed)
      sameSite: "none", // Allow cookies to be sent cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: "User signup successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while signing up", error });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "24h" });

    // Set the cookie
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production" ? true : false, // Disable secure flag for testing in non-production
      httpOnly: false, // Accessible from frontend for development (set to true in production if needed)
      sameSite: "none", // Allow cookies to be sent cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: "User logged in successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while logging in", error });
  }
});

// Route to update profile
router.patch('/profile/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.avatar = req.body.avatar;
    await user.save();
    return res.status(200).json({ message: 'Profile updated', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating profile', error });
  }
});

// Route to update address
router.patch('/address/:id', async (req, res) => {
  const id = req.params.id;
  const { state, city, nearby } = req.body;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.address = { state, city, nearby };
    await user.save();
    return res.status(200).json({ message: 'Address updated', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating address', error });
  }
});

module.exports = router;
