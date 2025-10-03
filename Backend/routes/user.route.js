import express from "express";

import User from "../models/user.model.js";
import {
  allUsers,
  login,
  logout,
  signup,
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { sendOTPEmail } from "../middleware/otpconfig.js";

const router = express.Router();

router.post("/signup",  signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.put("/update-profile_pic",secureRoute, async (req, res) => {
  const { profile_pic } = req.body;
  const userId = req.user._id; 

  try {
    await User.findByIdAndUpdate(userId, { profile_pic });
    res.status(200).send({ message: "Profile picture updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to update profile picture." });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const bcrypt = (await import("bcryptjs")).default;
    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Store OTPs in-memory for demo (use Redis or DB for production)
const deleteAccountOtps = {};

router.post('/send-delete-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  deleteAccountOtps[email] = otp;
  try {
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent for account deletion' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-delete-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (deleteAccountOtps[email] === otp) {
    delete deleteAccountOtps[email];
    return res.status(200).json({ verified: true });
  }
  res.status(400).json({ error: 'Invalid OTP' });
});

router.delete('/delete-account', async (req, res) => {
  const { email } = req.body;
  try {
    await User.findOneAndDelete({ email });
    res.clearCookie("jwt");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
