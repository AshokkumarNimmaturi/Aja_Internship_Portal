import axiosInstance from "./axiosInstance";

// FETCH TWILIO IDENTITY TOKEN
export const getVoiceToken = (identity) => axiosInstance.get(`/voice/token?identity=${encodeURIComponent(identity)}`);

// CHECK SUPPORT AVAILABILITY
export const checkAvailability = () => axiosInstance.get("/voice/availability");
