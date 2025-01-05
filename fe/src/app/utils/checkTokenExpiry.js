// src/utils/axiosInterceptor.js
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext"; // Assuming refreshToken is a function you've defined elsewhere

const { refreshToken } = useAuth();
// Add the response interceptor
export const setupAxiosInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response, // If the response is successful, just return it
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Token has expired
        await refreshToken(); // Attempt to refresh the token
        return axios(error.config); // Retry the original request with the new token
      }
      return Promise.reject(error); // Reject the error if not a 401
    }
  );
};
