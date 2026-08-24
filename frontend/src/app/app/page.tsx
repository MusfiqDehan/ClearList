import { AuthProvider } from "@/components/providers/AuthProvider";
import { TodoDashboard } from "@/components/todos/TodoDashboard";

export default function WorkspacePage() {
  return (
    <AuthProvider>
      <TodoDashboard />
    </AuthProvider>
  );
}
