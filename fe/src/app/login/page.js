"use client";
import { useForm } from "react-hook-form";
import { TextField, Button, Typography, Box } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import GoogleIcon from "@mui/icons-material/Google"; // Import Google Icon
import { GoogleLogin } from "@react-oauth/google"; // Import từ gói mới

export default function Login() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth(); // Get the login function from the context

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password); // Use login function from useAuth to authenticate
      toast.success("Login successful!");
      router.push("../profile"); // Redirect to profile page
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const password = watch("password");

  // Xử lý login với Google
  const handleGoogleLogin = async (response) => {
    try {
      // Gửi token Google tới server để xác thực
      const googleToken = response?.credential;
      console.log(`google token: `, googleToken);
      await loginWithGoogle(googleToken); // Gọi API để xử lý đăng nhập
      toast.success("Login successful!");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Failed to login with Google.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        maxWidth: 400,
        margin: "auto",
        padding: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Login
      </Typography>

      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ""}
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            message: "Invalid email format",
          },
        })}
      />

      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        error={!!errors.password}
        helperText={errors.password ? errors.password.message : ""}
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
      />

      <Button variant="contained" color="primary" type="submit" fullWidth>
        Log In
      </Button>

      {/* Register Button */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => router.push("/register")} // Navigate to the registration page
        fullWidth
        sx={{ marginTop: 2 }}
      >
        Register
      </Button>

      {/* Google Login Button */}
      <GoogleLogin
        onSuccess={handleGoogleLogin} // Hàm callback khi đăng nhập thành công
        onError={() => toast.error("Google login failed")} // Xử lý lỗi khi đăng nhập thất bại
      />

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseDrag
      />
    </Box>
  );
}
