import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import { SocketProvider } from "./contexts/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cricket Match Analysis",
  description: "Host and analyze cricket matches with live scoring.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-[#3c3c3c]">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
