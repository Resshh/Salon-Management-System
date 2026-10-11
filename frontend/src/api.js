import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// make api

const api = axios.create({
    baseURL: `${API_URL}/api`
});

// interceptor runs before every request leaves.

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});


export function showError(text) {
    window.dispatchEvent(new CustomEvent("app-error", { detail: text }));
}

// Forget the login. The dashboard then opens the login page itself.
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
}

export default api;
