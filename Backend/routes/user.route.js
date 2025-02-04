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

export default router;
