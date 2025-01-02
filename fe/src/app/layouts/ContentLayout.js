// src/app/layouts/ContentLayout.js (Nested Layout)
"use client";
import { useEffect } from "react";
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

export default function ContentLayout({ children }) {
  const { user, logout } = useAuth(); // Lấy user và logout từ context
  return (
    <div className="content-layout">
      {/* Global Header / Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
        <Container>
          {/* Left Navigation */}
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/tasks">
              Tasks
            </Nav.Link>
            <Nav.Link as={Link} href="/schedule">
              {/* <Nav.Link as={Link} href="/tasks"> */}
              Schedule
            </Nav.Link>
          </Nav>

          {/* Right Navigation: Always Show Avatar */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-basic"
              className="bg-transparent border-0 p-0"
            >
              <Image
                src={user?.photoURL || "/default-avatar.png"} // Use default avatar if not logged in
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
                  <Dropdown.Item as={Link} href="/profile">
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </>
              ) : (
                <>
                  <Dropdown.Item as={Link} href="/login">
                    Login
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} href="/register">
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
  );
}
