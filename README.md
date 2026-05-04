# Matchble - Real-time Chat Application 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20MongoDB-blue)](https://expressjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-orange)](https://react.dev/)

**Matchble** is a modern, full-stack real-time chat and social connection platform built with React, Node.js, Express, MongoDB, and Stream Chat. It features user authentication, friend requests, notifications, file uploads, theme switching, and video calls.

---

## ✨ Features

* 🔐 **User Authentication**: Secure login, signup, password reset with email verification (Nodemailer)
* 💬 **Real-time Messaging**: Powered by Stream Chat for instant messaging, typing indicators, and read receipts
* 👥 **Social Features**: Friends list, friend requests, user profiles with avatar uploads
* 🔔 **Notifications**: Real-time push notifications for messages and friend requests
* 🖼️ **Media Support**: Image uploads and sharing in chats
* 📹 **Video Calls**: Integrated video calling using Stream Video SDK
* 🌗 **Dark/Light Mode**: Theme toggle with persistence
* 📱 **Responsive UI**: Mobile-first design with Tailwind CSS and DaisyUI
* ⚙️ **Profile Management**: Edit profile and settings

---

## 🛠 Tech Stack

| Category     | Technologies                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Backend**  | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer, Nodemailer, Stream Chat             |
| **Frontend** | React 18, Vite, TailwindCSS, DaisyUI, React Router, Zustand, TanStack Query, Stream Chat React |
| **Other**    | Axios, Lucide React, React Hot Toast                                                           |

---

## 📁 Project Structure

```
Matchble/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── uploads/
│   └── package.json
├── frontend/                # React + Vite client
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── lib/
│   ├── tailwind.config.js
│   └── package.json
├── package.json
├── README.md
└── TODO.md
```

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* MongoDB (local or Atlas)
* Stream account (for chat/video APIs)

---

### Setup

#### 1. Clone the repo

```bash
git clone https://github.com/futureteqsolutions/Matchble.git
cd Matchble
```

---

#### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on:

```
http://localhost:5001
```

---

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables (backend/.env)

```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_super_secret
STREAM_API_KEY=your_stream_key
STREAM_SECRET=your_stream_secret
NODEMAILER_EMAIL=your_email
NODEMAILER_PASS=your_app_password
PORT=5001
```

---

## 📚 API Endpoints

| Method | Endpoint           | Description  |
| ------ | ------------------ | ------------ |
| POST   | /api/auth/login    | User login   |
| POST   | /api/auth/signup   | User signup  |
| GET    | /api/users/profile | Get profile  |
| POST   | /api/chat/messages | Send message |
| GET    | /api/chat/:id      | Chat history |
| POST   | /api/upload        | Upload image |

---

## 📱 Screenshots

> Add your real screenshots here for best impact

---

## 🌍 Live Demo

> Add your deployed link here after deployment

---

## 🤝 Contributing

1. Fork the project
2. Create your branch (`git checkout -b feature/feature-name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push (`git push origin feature/feature-name`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙌 Acknowledgments

* Stream Chat
* Vite
* Tailwind CSS
* DaisyUI

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 📢 Share it

---

> Built with passion to connect people 💙

testing 