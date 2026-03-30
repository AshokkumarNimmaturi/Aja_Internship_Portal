import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/auth",
});

// REGISTER
export const registerUser = (data) => API.post("/register", data);

// LOGIN
export const loginUser = (data) => API.post("/login", data);

// FORGOT PASSWORD
export const forgotPassword = (email) =>
  API.post("/forgot-password", { email });

// RESET PASSWORD
export const resetPassword = (data) => API.post("/reset-password", data);
