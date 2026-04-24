import axiosInstance from "./axiosInstance";

// SUBMIT NEW INTELLIGENCE (EMPLOYEE)
export const submitQuestion = (payload) => axiosInstance.post("/questions", payload);

// DISCOVER QUESTIONS (SUBSCRIBER)
export const fetchQuestions = (params = {}) => axiosInstance.get("/questions", { params });

// FETCH SINGLE QUESTION DETAIL
export const fetchQuestionById = (id) => axiosInstance.get(`/questions/${id}`);

// FETCH RECENT QUESTIONS (DASHBOARD)
export const fetchRecentQuestions = () => axiosInstance.get("/questions/recent");

// RECORD QUESTION VISIT
export const recordQuestionVisit = (id) => axiosInstance.post(`/questions/${id}/visit`);

// FETCH ALL BOOKMARKS
export const getBookmarks = () => axiosInstance.get("/bookmarks");

// TOGGLE BOOKMARK STATUS
export const toggleBookmarkApi = (id) => axiosInstance.post(`/bookmarks/${id}`);

// FETCH ANSWERS FOR A QUESTION
export const getQuestionAnswers = (id) => axiosInstance.get(`/answers/${id}`);

// SUBMIT ANSWER (INTERNAL/SUBSCRIBER)
export const submitAnswer = (id, data) => axiosInstance.post(`/answers/${id}`, data);

// FETCH MY ANSWERS (SUBSCRIBER/EXPERT)
export const fetchMyAnswers = () => axiosInstance.get("/answers/my");

// FETCH MY SUBMISSIONS (EMPLOYEE)
export const fetchMyQuestions = () => axiosInstance.get("/questions/my");

// GET MODERATION QUEUE (TUTOR)
export const fetchPendingQuestions = () => axiosInstance.get("/questions/pending");

// REVIEW & PUBLISH (TUTOR)
export const reviewQuestion = (id, data) => axiosInstance.put(`/questions/${id}/review`, data);

// MODERATION & CURATION (INTERNAL/ADMIN)
export const updateQuestion = (id, data) => axiosInstance.put(`/questions/${id}`, data);
export const setOfficialAnswer = (id, data) => axiosInstance.put(`/questions/${id}/official-answer`, data);
