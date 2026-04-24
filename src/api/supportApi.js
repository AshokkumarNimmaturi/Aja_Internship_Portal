import axiosInstance from "./axiosInstance";

// SUPPORT TICKETING
export const fetchSupportTickets = () => axiosInstance.get("/support");
export const updateSupportTicketStatus = (id, status) => axiosInstance.put(`/support/${id}/status?status=${status}`);
