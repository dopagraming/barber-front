import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  const token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("api/auth/me");
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("api/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      console.log(user.role);
      toast.success("تم تسجيل الدخول بنجاح");
      return { success: true, role: user.role };
    } catch (error) {
      const message =
        error.response?.data?.message || "حدث خطأ في تسجيل الدخول";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("api/auth/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      toast.success("تم إنشاء الحساب بنجاح");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "حدث خطأ في إنشاء الحساب";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Optional: get ID token to send to backend for verification
      const idToken = await googleUser.getIdToken();

      const response = await api.post("api/auth/google", { idToken });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      toast.success("تم تسجيل الدخول عبر Google");
      return { success: true };
    } catch (error) {
      console.error("Google login error", error);
      toast.error("فشل تسجيل الدخول عبر Google");
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
