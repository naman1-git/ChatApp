const createTokenAndSaveCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", // Ensures secure cookies in production
    sameSite: "None", // REQUIRED for cross-origin cookies
  });

  res.status(200).json({ success: true, message: "Logged in successfully" }); // Send response
};

