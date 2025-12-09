import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import { SocketProvider } from "./contexts/SocketContext";
import GoogleWrapper from "./components/auth/GoogleWrapper";
const greenEnergy = localFont({
  src: './Green_Energy.ttf',
  display: 'swap',
  weight: '700',
style: 'normal'
})
export const metadata = {
  title: "Kangaroo Code",
  description: "Host and analyze cricket matches with live scoring.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

      </head>
      <body className={greenEnergy.className}>
       <GoogleWrapper> 
          <AuthProvider>
            <SocketProvider>
             
                <Navbar />
                <main className={greenEnergy.className}>
                  {children}
                </main>
          
            </SocketProvider>
          </AuthProvider>
        </GoogleWrapper>
      </body>
    </html>
  );
}

