import axiosInstance from "./axiosInstance";

// FETCH TECHNOLOGY LIST
export const fetchTechnologies = () => axiosInstance.get("/technologies");

// CREATE NEW TECHNOLOGY CATEGORY
export const createTechnology = (data) => axiosInstance.post("/technologies", data);
