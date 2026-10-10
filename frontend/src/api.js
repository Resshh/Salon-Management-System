import axios from "axios";

// One place for everything about talking to the backend.
//
// How to use it in a component:
//   import api, { showError } from "../../api";
//   const response = await api.get("/service/");
//   await api.post("/feedback", { rating: 5 });

// Where the backend lives. When the app is deployed, set VITE_API_URL
// in a .env file; on your own computer it falls back to localhost.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// "api" is axios with the backend address already filled in,
// so api.get("/service/") calls http://localhost:5000/api/service/
const api = axios.create({
    baseURL: `${API_URL}/api`
});

// An interceptor runs before every request leaves.
// This one adds the login token, so no component has to add the header itself.
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

// Show a red error message in the top right corner, from any component.
// It sends a browser event; ErrorToast.jsx (placed once in App.jsx) listens for it.
export function showError(text) {
    window.dispatchEvent(new CustomEvent("app-error", { detail: text }));
}

// Forget the login and go back to the login page
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
}

export default api;
