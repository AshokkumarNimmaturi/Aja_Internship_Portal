import axiosInstance from "./axiosInstance";

// CREATE RAZORPAY ORDER
export const createOrder = (data) => axiosInstance.post("/payment/create-order", data);

// VERIFY PAYMENT SIGNATURE
export const verifyPayment = (data) => axiosInstance.post("/payment/verify", data);

// FETCH USER SUBSCRIPTION STATUS
export const fetchMySubscription = () => axiosInstance.get("/subscriptions/my");
