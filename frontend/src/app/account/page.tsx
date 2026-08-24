import { AuthProvider } from "@/components/providers/AuthProvider";
import { ProfilePage } from "@/components/profile/ProfilePage";

export default function AccountPage() {
  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  );
}
