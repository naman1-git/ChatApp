import express from "express";
import User from "../models/user.model.js";
import {
  allUsers,
  login,
  logout,
  signup,
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router();

router.post("/signup",  signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.put("/update-profile_pic",secureRoute, async (req, res) => {
  const { profile_pic } = req.body;
  const userId = req.user._id; // Assuming you're using middleware to fetch user info

  try {
    await User.findByIdAndUpdate(userId, { profile_pic });
    res.status(200).send({ message: "Profile picture updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to update profile picture." });
  }
});

export default router;
