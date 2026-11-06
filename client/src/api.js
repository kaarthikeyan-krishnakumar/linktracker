import { getToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (path, { method = "GET", body } = {}) => {
    const headers = {};
    const token = getToken();

    if (body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error("Cannot reach the server. Is the backend running?");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};