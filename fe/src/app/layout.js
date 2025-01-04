import localFont from "next/font/local";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";
import ContentLayout from "@/app/layouts/ContentLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import AddBootstrap from "./addBootstrap";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <AddBootstrap />
          <ContentLayout>{children}</ContentLayout>
        </body>
      </html>
    </AuthProvider>
  );
}