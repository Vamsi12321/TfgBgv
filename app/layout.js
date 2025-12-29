// app/layout.jsx
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "TFG Reports",
  description: "Background Verification Platform",

  icons: {
    icon: "/logos/tfgLogo.jpeg", // favicon
    shortcut: "/logos/tfgLogo.jpeg",
    apple: "/logos/tfgLogo.jpeg", // iOS home screen (optional)
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
