import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs"; // Added this import
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import uploadRoutes from "./routes/upload.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;



// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists in the backend root
// Since server.js is in /src, we go up one level to the backend root
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads directory at:", uploadDir);
}

app.use(
  cors({
    origin: "https://matchble.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files using an absolute path
// This is the CRITICAL fix for the "invisible" photos
app.use("/uploads", express.static(uploadDir));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

 if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
});
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});