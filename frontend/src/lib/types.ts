export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  timezone: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  is_active: boolean;
};

export type ProfileInput = {
  name: string;
  phone: string;
  timezone: string;
  bio: string;
  avatar_url: string;
};

export type Todo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TodoInput = {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string | null;
};

export type TodoStatus = "all" | "active" | "completed";

export type PendingApproval = {
  id: string;
  tool: string;
  arguments: Record<string, unknown>;
  reason: string | null;
};

export type AssistantResponse = {
  text: string;
  conversation_id: string | null;
  should_refresh: boolean;
  pending_approvals: PendingApproval[];
};

export type AdminMetrics = {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
};

export type AdminUser = {
  type: "user";
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  created_at: string | null;
};

export type AdminInvitation = {
  type: "invitation";
  id: number;
  name: null;
  email: string;
  is_admin: false;
  is_active: false;
  total_tasks: 0;
  completed_tasks: 0;
  pending_tasks: 0;
  created_at: string | null;
  expires_at: string | null;
};

export type AdminDirectoryEntry = AdminUser | AdminInvitation;

export type AdminUserStatus = "all" | "active" | "inactive" | "invited";

export type PaginatedAdminUsers = {
  data: AdminDirectoryEntry[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type InvitationPreview = {
  email: string;
  expires_at: string;
};
