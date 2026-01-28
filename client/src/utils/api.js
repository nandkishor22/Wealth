import axios from "axios";

const API = axios.create({
    // Dynamically use the current hostname but keep port 5000
    baseURL: process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`,
});

API.interceptors.request.use((req) => {
    const storedUser = localStorage.getItem("wealth_user");
    if (storedUser) {
        const { token } = JSON.parse(storedUser);
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
