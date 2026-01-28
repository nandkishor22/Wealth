import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("wealth_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post("/auth/login", { email, password });
            setUser(data);
            localStorage.setItem("wealth_user", JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Login failed"
            };
        }
    };

    const register = async (name, email, phone, password) => {
        try {
            const { data } = await API.post("/auth/register", {
                name, email, phone, password
            });
            setUser(data);
            localStorage.setItem("wealth_user", JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Registration failed"
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("wealth_user");
    };

    const updateProfile = async (profileData) => {
        try {
            const { data } = await API.put("/auth/profile", profileData);
            setUser(data);
            localStorage.setItem("wealth_user", JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Update failed"
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
