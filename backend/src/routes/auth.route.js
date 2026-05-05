import express from "express";
import { 
  login, 
  logout, 
  onboard, 
  signup,
  sendVerification,
  verifyCode,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

// Email verification routes
router.post("/send-verification", sendVerification);
router.post("/verify-code", verifyCode);
router.post("/verify-otp", verifyCode);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

// Change password (requires authentication)
router.put("/change-password", protectRoute, changePassword);

// Delete account (requires authentication)
router.delete("/delete-account", protectRoute, deleteAccount);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
