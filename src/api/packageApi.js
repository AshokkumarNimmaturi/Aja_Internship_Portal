import axiosInstance from "./axiosInstance";

// FETCH ALL PACKAGES
export const fetchPackages = () => axiosInstance.get("/packages");

// FETCH SINGLE PACKAGE
export const fetchPackageById = (id) => axiosInstance.get(`/packages/${id}`);

// CREATE NEW PACKAGE (ADMIN)
export const createPackage = (data) => axiosInstance.post("/packages", data);
