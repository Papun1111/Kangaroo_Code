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
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Gochi+Hand&display=swap" rel="stylesheet"/>
      </head>
      <body >
       <GoogleWrapper> 
          <AuthProvider>
            <SocketProvider>
             
                <Navbar />
                <main >
                  {children}
                </main>
          
            </SocketProvider>
          </AuthProvider>
        </GoogleWrapper>
      </body>
    </html>
  );
}

