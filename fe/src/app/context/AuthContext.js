// src/context/AuthContext.js
"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation"; // Updated for Next.js 14
import axios from "axios";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, app } from "@/app/components/firebase"; // Đường dẫn tới file firebase.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    if (token) {
      console.log(`token: `, token);
      fetchProfile();
    }
  }, [token]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log(`user: `, user?.username);
    }
  }, [user]);

  const fetchProfile = async () => {
    // const storedToken = localStorage.getItem("token");
    // if (!storedToken) {
    //   router.push("../login");
    //   return;
    // } else {
    //   setToken(storedToken);
    // }
    try {
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("res.data:", res.data);
      setUser((prev) => ({
        ...prev,
        ...res.data, // Cập nhật dữ liệu user state
      }));
      localStorage.setItem("user", user);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const login = async (email, password) => {
    // if (user) {
    //   router.push("../profile");
    // }
    try {
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/user/login`);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
        {
          email,
          password,
        }
      );
      const receivedToken = res.data.idToken;
      //console.log(`token: ${receivedToken}`);
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${receivedToken}`;
      fetchProfile();
      router.push("../profile");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const loginWithGoogle = async (googleIdToken) => {
    try {
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await signInWithCredential(auth, credential);

      // Lấy Firebase ID Token
      const firebaseIdToken = await userCredential.user.getIdToken();

      console.log(`${process.env.NEXT_PUBLIC_API_URL}/user/login-google`);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/login-google`,
        {
          googleIdToken: firebaseIdToken,
        }
      );
      const receivedToken = res.data.idToken;
      //console.log(`token: ${receivedToken}`);
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${receivedToken}`;
      fetchProfile();
      router.push("../profile");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    router.push("../login");
  };

  const updateUser = async (updatedData) => {
    try {
      console.log("Update data:", updatedData);
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile/update`, // API Endpoint
        updatedData, // Data cần cập nhật
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Update response:", res);
      setUser((prev) => ({
        ...prev,
        ...res.data, // Cập nhật dữ liệu user state
      }));

      fetchProfile();
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
