import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import { SocketProvider } from "./contexts/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kangaroo Code",
  description: "Host and analyze cricket matches with live scoring.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Epunda+Slab:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet"></link>
      </head>
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
