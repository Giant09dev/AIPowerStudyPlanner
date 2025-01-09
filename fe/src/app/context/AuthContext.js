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
import Cookies from "js-cookie";

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
      // console.log(`token: `, token);
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
      // console.log("res.data:", res.data);
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
      // Kiểm tra nếu server trả về token thì mới tiếp tục
      if (res.data && res.data.idToken) {
        const receivedToken = res.data.idToken;
        const receivedRefreshToken = res.data.refreshToken;

        storeRefreshToken(receivedRefreshToken);
        // console.log(`token: ${receivedToken}`);
        // console.log(`refreshToken: ${receivedRefreshToken}`);

        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);
        refreshToken();

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${receivedToken}`;

        // Chuyển đến trang profile sau khi đăng nhập thành công
        return true;
      } else {
        console.error("Invalid login response: Missing token");
        throw new Error("Login failed: Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Ném lỗi để onSubmit xử lý
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
      if (res.data && res.data.idToken) {
        const receivedToken = res.data.idToken;
        //console.log(`token: ${receivedToken}`);
        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${receivedToken}`;
        router.push("../profile");
      } else {
        console.error("Invalid login response: Missing token");
        throw new Error("Login failed: Invalid response from server.");
      }
    } catch (error) {
      console.error("LoginWithGoogle error:", error);
      throw error; // Ném lỗi để onSubmit xử lý
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    removeRefreshToken();
    delete axios.defaults.headers.common["Authorization"];
    router.push("../login");
  };

  const updateUser = async (updatedData) => {
    try {
      // console.log("Update data:", updatedData);
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile/update`, // API Endpoint
        updatedData, // Data cần cập nhật
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log("Update user response:", res.data);
      setUser((prev) => ({
        ...prev,
        username: res.data.username, // Cập nhật dữ liệu user state
        photoURL: res.data.photoURL, // Cập nhật dữ liệu user state
      }));
      // console.log("New user profile", user);
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  // On logout
  const removeRefreshToken = () => {
    Cookies.remove("refreshToken");
  };

  // When user logs in
  const storeRefreshToken = (refreshToken) => {
    // Store refresh token in HttpOnly cookie
    Cookies.set("refreshToken", refreshToken, {
      expires: 30, // Expires in 30 days (change as needed)
      secure: process.env.NODE_ENV === "production", // Use secure flag for production
      sameSite: "Strict", // Helps prevent CSRF attacks
      path: "/", // Cookie is accessible throughout the site
    });
  };

  const refreshToken = async () => {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      // No refresh token available, force user to log in again
      logout();
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user/refresh-auth`, // Backend endpoint to refresh token
        { refreshToken }
      );
      const newAccessToken = res.data.idToken;

      // Store the new access token and refresh token in the client (localStorage and cookies)
      localStorage.setItem("token", newAccessToken);
      // console.log(`new access token: `, newAccessToken);
      setToken(newAccessToken);

      // Update the token in axios headers
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newAccessToken}`;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout(); // Log the user out if refresh fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        loginWithGoogle,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
