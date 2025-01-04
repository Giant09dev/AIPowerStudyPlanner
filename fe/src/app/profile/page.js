"use client";
import { useForm } from "react-hook-form";
import { TextField, Button, Typography, Box, Avatar } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  // const router = useRouter();

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      password: "",
    },
  });

  // Nếu user có dữ liệu, reset form để cập nhật giá trị mặc định
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        password: "", // không cần reset mật khẩu vì có thể để trống
      });
    }
  }, [user, reset]); // Chạy lại khi `user` thay đổi

  // Xử lý submit form
  const onSubmit = async (data) => {
    try {
      const updatedData = {};

      // Chỉ gửi các trường có giá trị không rỗng
      if (data.username) updatedData.username = data.username;
      if (data.password) updatedData.password = data.password;

      await updateUser(updatedData); // Gửi thông tin cập nhật qua context
      toast.success("Profile updated successfully!");
      reset({ ...data, password: "" }); // Reset form nhưng không giữ lại password
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile.");
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
        marginTop: 5,
      }}
    >
      {/* Tiêu Đề */}
      <Typography variant="h4" component="h2" gutterBottom>
        Profile
      </Typography>

      {/* Avatar */}
      <Avatar
        src={user?.photoURL || "/default-avatar.png"}
        alt="Avatar"
        sx={{ width: 80, height: 80, marginBottom: 2 }}
      />

      {/* Username */}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        error={!!errors.username}
        helperText={errors.username ? errors.username.message : ""}
        {...register("username", {
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters",
          },
          maxLength: {
            value: 20,
            message: "Username must be at most 20 characters",
          },
          pattern: {
            value: /^[a-zA-Z0-9_.-]*$/,
            message:
              "Username can only contain letters, numbers, dots, and dashes",
          },
        })}
      />

      {/* Password */}
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        error={!!errors.password}
        helperText={
          errors.password
            ? errors.password.message
            : "Leave blank if you don't want to update password"
        }
        {...register("password", {
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
          maxLength: {
            value: 20,
            message: "Password must be at most 20 characters",
          },
        })}
      />

      {/* Nút Submit */}
      <Button variant="contained" color="primary" type="submit" fullWidth>
        Save Changes
      </Button>

      {/* Nút Logout */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={logout}
        sx={{ marginTop: 1 }}
        fullWidth
      >
        Logout
      </Button>

      {/* Toast Container */}
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
