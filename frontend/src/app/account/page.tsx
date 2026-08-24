import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata: Metadata = {
  title: "Your account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  );
}
