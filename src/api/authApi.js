import axiosInstance from "./axiosInstance";

// REGISTER
export const registerUser = (data) => axiosInstance.post("/auth/register", data);

// LOGIN
export const loginUser = (data) => axiosInstance.post("/auth/login", data);

// FORGOT PASSWORD
export const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

// RESET PASSWORD
export const resetPassword = (data) => axiosInstance.post("/auth/reset-password", data);

// CHANGE PASSWORD (AUTHENTICATED)
export const changePassword = (data) => axiosInstance.post("/auth/change-password", data);

// USER IDENTITY & PROFILE
export const fetchMe = () => axiosInstance.get("/auth/me");
export const updateProfile = (data) => axiosInstance.put("/auth/profile", data);
