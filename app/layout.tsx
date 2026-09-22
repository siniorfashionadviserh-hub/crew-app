import type { Metadata } from "next";
import { AuthProvider } from "@/app/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "CREW α版",
  description: "SNS Director AI - Content Strategy & Shooting Guides",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
