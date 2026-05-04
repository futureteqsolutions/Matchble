import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Temporary storage for verification codes (Email -> Code)
// In a large production app, use Redis. For your project, a Map works great!
const verificationStore = new Map();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,        // Force Port 465
    secure: true,     // Force SSL (true for 465, false for other ports)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email, code) => {
  try {
    // Check if credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[DEV MODE] SMTP not configured. Code for ${email}: ${code}`);
      return true; 
    }

    const transporter = createTransporter();

await transporter.sendMail({
      from: `"Matchgle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Matchgle account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a5a); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Matchgle</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px;">Thank you for joining Matchgle! Use the code below to complete your registration:</p>
            <div style="background: #fff5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #ff6b6b;">
              <span style="font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">This code expires in 10 minutes.</p>
          </div>
        </div>
      `,
    });

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;

const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Matchgle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Matchgle password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Click the button below to reset your password. This link is valid for 30 minutes.</p>
          <a href="${resetUrl}" style="background: #ff6b6b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Reset Email Error:", error);
    return false;
  }
};

export async function signup(req, res) {
  const { email, password, fullName, age, gender, lookingFor, bio, location, interests } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const idx = Math.floor(Math.random() * 70) + 1;
    const newUser = await User.create({
      email,
      fullName,
      password,
      age,
      gender,
      lookingFor,
      bio,
      location,
      interests,
      profilePic: `https://i.pravatar.cc/150?img=${idx}`,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (error) {
      console.log("Stream error:", error.message);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    user.isOnline = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  if (req.user) {
    User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() }).catch(console.error);
  }
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function sendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in our Map
    verificationStore.set(email, code);

    // Set code to expire in 10 minutes
    setTimeout(() => {
        verificationStore.delete(email);
    }, 10 * 60 * 1000);

    const emailSent = await sendVerificationEmail(email, code);
    
    if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
    }

    res.status(200).json({ success: true, message: "Verification code sent to your email!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;
    const savedCode = verificationStore.get(email);

    if (!savedCode) {
      return res.status(400).json({ message: "Code expired or not found. Please resend." });
    }

    if (savedCode === code) {
      verificationStore.delete(email); // Delete after success so it can't be reused
      res.status(200).json({ success: true, message: "Email verified successfully!" });
    } else {
      res.status(400).json({ message: "The code you entered is incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const sent = await sendPasswordResetEmail(email, resetUrl);

    if (!sent) return res.status(500).json({ message: "Error sending reset email" });

    res.status(200).json({ success: true, message: "Password reset link sent!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ... (rest of the file remains the same until resetPassword)

export async function resetPassword(req, res) {
  try {
    const { resetToken } = req.params; // Ensure this matches the route parameter name
    const { password } = req.body;

    // 1. Hash the incoming plain text token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 2. Find user where hashed token matches and is not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // 3. Set new password and clear the reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.log("Error in resetPassword controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ... (rest of the file)

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password changed!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    await FriendRequest.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });
    await User.updateMany({ friends: userId }, { $pull: { friends: userId } });

    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function onboard(req, res) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body, isOnboarded: true },
      { new: true }
    );
    
    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || "",
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}