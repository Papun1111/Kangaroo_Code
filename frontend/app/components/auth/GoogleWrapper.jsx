"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleWrapper({ children }) {
  // Replace with your actual Client ID
  const clientId =process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}