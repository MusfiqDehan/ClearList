import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { TodoDashboard } from "@/components/todos/TodoDashboard";

export const metadata: Metadata = {
  title: "Your workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspacePage() {
  return (
    <AuthProvider>
      <TodoDashboard />
    </AuthProvider>
  );
}
