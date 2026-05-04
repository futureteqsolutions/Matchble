import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// Upload profile picture
router.post("/profile-pic", protectRoute, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

  const photoUrl = req.file.filename;

    // Update user's profile picture
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: photoUrl,
    });

    res.status(200).json({
      success: true,
      message: "Profile picture updated",
      profilePic: photoUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// Upload additional photos (Modified for your 2 extra photos requirement)
router.post("/photos", protectRoute, upload.array("photos", 2), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const photoUrls = req.files.map((file) => file.filename);

    const user = await User.findById(req.user._id);
    const currentPhotos = user.photos || [];
    
    // Maintain a max of 2 additional photos for the onboarding requirement
    const newPhotos = [...currentPhotos, ...photoUrls].slice(0, 2);

    await User.findByIdAndUpdate(req.user._id, {
      photos: newPhotos,
    });

    res.status(200).json({
      success: true,
      message: "Photos uploaded",
      photos: newPhotos,
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
});

export default router;