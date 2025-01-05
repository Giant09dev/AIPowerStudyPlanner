// src/utils/axiosInterceptor.js
import { useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";

// Custom hook để lấy refreshToken từ context và thiết lập interceptor
export const useAxiosInterceptor = () => {
  // Đảm bảo bạn export đúng
  const { refreshToken } = useAuth(); // Lấy refreshToken từ context

  useEffect(() => {
    // Thiết lập interceptor khi component mount
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Trả về phản hồi thành công
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Nếu token hết hạn (401)
          await refreshToken(); // Cố gắng làm mới token
          return axios(error.config); // Thử lại yêu cầu gốc với token mới
        }
        return Promise.reject(error); // Trả về lỗi nếu không phải 401
      }
    );

    // Dọn dẹp interceptor khi component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]); // Chạy lại khi refreshToken thay đổi
};
