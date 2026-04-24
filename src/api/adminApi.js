import axiosInstance from "./axiosInstance";

// USER GOVERNANCE
export const fetchUsersAdmin = () => axiosInstance.get("/admin/users");
export const deleteUserAdmin = (id) => axiosInstance.delete(`/admin/users/${id}`);
export const activateUserAdmin = (id) => axiosInstance.put(`/admin/users/${id}/activate`);
export const createUserAdmin = (data) => axiosInstance.post("/admin/users", data);
export const updateUserAdmin = (id, data) => axiosInstance.put(`/admin/users/${id}`, data);

// PLATFORM OPERATIONS
export const fetchAuditLogs = () => axiosInstance.get("/admin/audit-log");
export const fetchSupportCalls = () => axiosInstance.get("/admin/support-calls");
export const updateSupportStatusApi = (status) => axiosInstance.post(`/auth/support-status?status=${status}`);
