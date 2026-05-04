import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getUserProfile,
  blockUser,
  unblockUser,
  getBlockedUsers,
  updateSettings,
  searchUsers,
  likePhoto,
  getUnreadNotifications,
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/search", searchUsers);
router.get("/friends", getMyFriends);
router.get("/profile/:id", getUserProfile);
router.get("/blocked", getBlockedUsers);
router.get("/unread-notifications", getUnreadNotifications);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.put("/friend-request/:id/reject", rejectFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.post("/block/:id", blockUser);
router.post("/unblock/:id", unblockUser);

// Search users endpoint
router.post("/search", searchUsers);

// Like photo endpoint  
router.post("/photo-like", likePhoto);

router.put("/settings", updateSettings);

export default router;
