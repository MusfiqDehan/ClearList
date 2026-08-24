import { AuthForm } from "@/components/auth/AuthForm";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  return (
    <AuthProvider>
      <AuthForm mode="login" />
    </AuthProvider>
  );
}
