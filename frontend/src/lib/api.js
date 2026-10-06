import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let onUnauthorized = null;
// lets the app react (clear the user, go to login) when the session expires
export const setUnauthorizedHandler = (handler) => {
    onUnauthorized = handler;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);

// one readable message for any failed request, including when the server is down
export const getErrorMessage = (error) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.code === "ERR_NETWORK") return "Cannot reach the server. Please check that the backend is running.";
    return "Something went wrong. Please try again.";
}

export const resumeUrl = (userId) => `${API_BASE_URL}/user/resume/${userId}`;

export default api;
