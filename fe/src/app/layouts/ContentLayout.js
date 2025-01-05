// src/app/layouts/ContentLayout.js (Nested Layout)
"use client";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // Đảm bảo đúng đường dẫn
import Link from "next/link";
import {
  Navbar,
  Container,
  Nav,
  Button,
  Image,
  Dropdown,
} from "react-bootstrap"; // Import các component từ React Bootstrap
import "@/app/style/loader.css";

export default function ContentLayout({ children }) {
  const [isPending, startTransition] = useTransition();
  const { user, logout } = useAuth(); // Lấy user và logout từ context
  const router = useRouter();

  const handleNavigation = (href) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      {isPending && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="content-layout">
        {/* Global Header / Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
          <Container>
            {/* Left Navigation */}
            <Nav className="me-auto">
              <Nav.Link onClick={() => handleNavigation("/tasks")}>
                Tasks
              </Nav.Link>
              {/* <Nav.Link as={Link} href="/schedule"> */}
              <Nav.Link onClick={() => handleNavigation("/taskandschedule")}>
                Schedule
              </Nav.Link>
            </Nav>

            {/* Right Navigation: Always Show Avatar */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-basic"
                className="bg-transparent border-0 p-0"
                aria-label="User menu"
              >
                <Image
                  src={user?.photoURL || "/default_user.png"} // Use default avatar if not logged in
                  alt="Avatar"
                  roundedCircle
                  width={40}
                  height={40}
                />
              </Dropdown.Toggle>

              {/* Dropdown Content */}
              <Dropdown.Menu>
                {user ? (
                  <>
                    <Dropdown.Item onClick={() => handleNavigation("/profile")}>
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item onClick={() => handleNavigation("/login")}>
                      Login
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleNavigation("/register")}
                    >
                      Register
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Container>
        </Navbar>

        {/* Main Content */}
        <main className="container mt-4">{children}</main>
      </div>
    </>
  );
}
