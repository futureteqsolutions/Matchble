import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const { gender } = req.query;

    const query = {
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    };

    // Add gender filter if provided
    if (gender && gender !== "all") {
      query.$and.push({ gender: gender });
    }

    const recommendedUsers = await User.find(query);
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic age gender location isOnline");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    // Validate recipientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends (compare as strings for safety)
    const recipientFriends = recipient.friends.map(f => f.toString());
    if (recipientFriends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: new mongoose.Types.ObjectId(myId),
      recipient: new mongoose.Types.ObjectId(recipientId),
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    // Delete the friend request
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic age gender location");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic age gender location");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get user profile by ID
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -blockedUsers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current user is blocked by this user
    if (user.blockedUsers && user.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: "This user has blocked you" });
    }

    // Check if current user has blocked this user
    const currentUser = await User.findById(req.user._id);
    if (currentUser.blockedUsers && currentUser.blockedUsers.includes(id)) {
      return res.status(403).json({ message: "You have blocked this user" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Block user
export async function blockUser(req, res) {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const userToBlock = await User.findById(id);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(req.user._id);

    // Add to blocked list if not already blocked
    if (!user.blockedUsers.includes(id)) {
      user.blockedUsers.push(id);
      await user.save();

      // Remove from friends if they are friends
      user.friends = user.friends.filter((friendId) => friendId.toString() !== id);
      await user.save();

      // Also remove this user from the blocked user's friends
      await User.findByIdAndUpdate(id, {
        $pull: { friends: req.user._id },
      });
    }

    res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Unblock user
export async function unblockUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);

    user.blockedUsers = user.blockedUsers.filter((userId) => userId.toString() !== id);
    await user.save();

    res.status(200).json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get blocked users
export async function getBlockedUsers(req, res) {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "fullName profilePic"
    );

    res.status(200).json(user.blockedUsers || []);
  } catch (error) {
    console.error("Error in getBlockedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update user settings
export async function updateSettings(req, res) {
  try {
    const { soundEnabled, notificationSound, messageSound } = req.body;

    const user = await User.findById(req.user._id);

    if (soundEnabled !== undefined) user.settings.soundEnabled = soundEnabled;
    if (notificationSound !== undefined) user.settings.notificationSound = notificationSound;
    if (messageSound !== undefined) user.settings.messageSound = messageSound;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Settings updated",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Error in updateSettings controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Search users by name
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.length < 1) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search by name (case insensitive)
    const users = await User.find({
      fullName: { $regex: q, $options: "i" },
      _id: { $ne: currentUserId },
      isOnboarded: true,
    }).select("fullName profilePic age gender location isOnline");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Like a user's photo
export async function likePhoto(req, res) {
  try {
    const { photoUrl, userId } = req.body;
    const currentUserId = req.user.id;

    if (!photoUrl || !userId) {
      return res.status(400).json({ message: "Photo URL and User ID are required" });
    }

    const photoOwner = await User.findById(userId);
    if (!photoOwner) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a Notification document for the photo owner
    if (userId !== currentUserId) {
      await Notification.create({
        recipient: userId,
        sender: currentUserId,
        type: "photo_like",
        photoUrl: photoUrl,
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Photo liked!",
      likedBy: req.user.fullName
    });
  } catch (error) {
    console.error("Error in likePhoto controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get unread notifications count
export async function getUnreadNotifications(req, res) {
  try {
    const userId = req.user.id;
    
    // Get pending friend requests count
    const pendingRequests = await FriendRequest.countDocuments({
      recipient: userId,
      status: "pending"
    });

    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.status(200).json({
      friendRequests: pendingRequests,
      messages: 0, // Would come from chat/notifications system
      notifications: unreadNotificationsCount
    });
  } catch (error) {
    console.error("Error in getUnreadNotifications controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
