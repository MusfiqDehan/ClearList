import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
