"use client";

import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Header />
      <main className="page-main">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
