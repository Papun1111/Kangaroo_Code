import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import { SocketProvider } from "./contexts/SocketContext";
import GoogleWrapper from "./components/auth/GoogleWrapper";
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
<link rel="preconnect" href="https://fonts.gstatic.com"/>
<link href="https://fonts.googleapis.com/css2?family=Iceberg&family=Odibee+Sans&family=Syne+Mono&display=swap" rel="stylesheet"/>
      </head>
      <body className={inter.className}>
       <GoogleWrapper> 
          <AuthProvider>
            <SocketProvider>
             
                <Navbar />
                <main className="">
                  {children}
                </main>
          
            </SocketProvider>
          </AuthProvider>
        </GoogleWrapper>
      </body>
    </html>
  );
}
