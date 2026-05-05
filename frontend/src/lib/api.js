import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    console.log('[DEBUG API] Fetching /auth/me...');
    const res = await axiosInstance.get("/auth/me");
    console.log('[DEBUG API] /auth/me success:', res.data);
    return res.data;
  } catch (error) {
    console.error('[DEBUG API] /auth/me ERROR:', error.response?.status, error.response?.data || error.message);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data.filter(friend => friend != null && friend._id != null);
}

export async function getRecommendedUsers(genderFilter = "all") {
  const response = await axiosInstance.get(`/users?gender=${genderFilter}`);
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function rejectFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// Password management
export async function changePassword(currentPassword, newPassword) {
  const response = await axiosInstance.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
}

export async function deleteAccount(reason) {
  const response = await axiosInstance.delete("/auth/delete-account", {
    data: { reason },
  });
  return response.data;
}

// User profile
export async function getUserProfile(userId) {
  const response = await axiosInstance.get(`/users/profile/${userId}`);
  return response.data;
}

// Block/Unblock
export async function blockUser(userId) {
  const response = await axiosInstance.post(`/users/block/${userId}`);
  return response.data;
}

export async function unblockUser(userId) {
  const response = await axiosInstance.post(`/users/unblock/${userId}`);
  return response.data;
}

export async function getBlockedUsers() {
  const response = await axiosInstance.get("/users/blocked");
  return response.data;
}

// Settings
export async function updateSettings(settings) {
  const response = await axiosInstance.put("/users/settings", settings);
  return response.data;
}

// File uploads
export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const response = await axiosInstance.post("/upload/profile-pic", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function uploadPhotos(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("photos", file);
  });
  const response = await axiosInstance.post("/upload/photos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deletePhoto(photoUrl) {
  const response = await axiosInstance.delete("/upload/photos", {
    data: { photoUrl },
  });
  return response.data;
}

export async function getMyProfile() {
  const response = await axiosInstance.get("/upload/my-profile");
  return response.data;
}

// Search users by name
export async function searchUsers(query) {
  const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

// Like a photo
export async function likePhoto(photoUrl, userId) {
  const response = await axiosInstance.post("/users/photo-like", { photoUrl, userId });
  return response.data;
}

// Get unread notifications count
export async function getUnreadNotifications() {
  const response = await axiosInstance.get("/users/unread-notifications");
  return response.data;
}
