"use client";
import { useState, useEffect } from "react";
import { Button, Typography, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useAxiosInterceptor } from "@/app/utils/checkTokenExpiry";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Access user and logout function

  useAxiosInterceptor(); // Gọi custom hook để thiết lập interceptor

  return (
    <Box
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
        textAlign: "center",
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Welcome to the Home Page
      </Typography>

      <Typography variant="body1" gutterBottom>
        {user ? `Logged in as: ${user.email}` : "You are not logged in."}
      </Typography>

      {/* Conditional Rendering of Buttons */}
      {user ? (
        <>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => router.push("/profile")}
          >
            Go to Profile
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={logout}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => router.push("/register")}
          >
            Go to Register
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => router.push("/login")}
          >
            Go to Login
          </Button>
        </>
      )}
    </Box>
  );
}
