import axios from "axios";
import type {
  AdminMetrics,
  AdminUser,
  AdminUserStatus,
  AssistantResponse,
  InvitationPreview,
  PaginatedAdminUsers,
  ProfileInput,
  Todo,
  TodoInput,
  TodoStatus,
  User,
} from "@/lib/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

export const getCsrfCookie = async (): Promise<void> => {
  await api.get("/sanctum/csrf-cookie");
};

export const authApi = {
  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    await getCsrfCookie();
    const { data } = await api.post<{ user: User }>("/api/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return data.user;
  },

  async login(email: string, password: string, remember: boolean) {
    await getCsrfCookie();
    const { data } = await api.post<{ user: User }>("/api/login", {
      email,
      password,
      remember,
    });
    return data.user;
  },

  async logout() {
    await api.post("/api/logout");
  },

  async user() {
    const { data } = await api.get<{ user: User }>("/api/user");
    return data.user;
  },
};

export const profileApi = {
  async update(input: ProfileInput) {
    const { data } = await api.patch<{ data: User }>("/api/profile", input);
    return data.data;
  },
};

export const invitationsApi = {
  async preview(token: string) {
    const { data } = await api.get<InvitationPreview>(`/api/invitations/${token}`);
    return data;
  },

  async accept(token: string, name: string, password: string, passwordConfirmation: string) {
    await getCsrfCookie();
    const { data } = await api.post<{ user: User }>(`/api/invitations/${token}/accept`, {
      name,
      password,
      password_confirmation: passwordConfirmation,
    });
    return data.user;
  },
};

export const adminApi = {
  async metrics() {
    const { data } = await api.get<{ data: AdminMetrics }>("/api/admin/metrics");
    return data.data;
  },

  async users(status: AdminUserStatus, search: string, page = 1) {
    const { data } = await api.get<PaginatedAdminUsers>("/api/admin/users", {
      params: {
        status,
        search: search || undefined,
        page,
        per_page: 10,
      },
    });
    return data;
  },

  async updateStatus(id: number, isActive: boolean) {
    const { data } = await api.patch<{ user: AdminUser; message: string }>(
      `/api/admin/users/${id}/status`,
      { is_active: isActive },
    );
    return data;
  },

  async deleteUser(id: number) {
    await api.delete(`/api/admin/users/${id}`);
  },

  async invite(email: string) {
    const { data } = await api.post<{ message: string }>("/api/admin/invitations", { email });
    return data;
  },

  async resendInvitation(id: number) {
    const { data } = await api.post<{ message: string }>(
      `/api/admin/invitations/${id}/resend`,
    );
    return data;
  },

  async deleteInvitation(id: number) {
    await api.delete(`/api/admin/invitations/${id}`);
  },
};

export const todosApi = {
  async list(status: TodoStatus, search: string) {
    const { data } = await api.get<{ data: Todo[] }>("/api/todos", {
      params: { status, search: search || undefined },
    });
    return data.data;
  },

  async create(input: TodoInput) {
    const { data } = await api.post<{ data: Todo }>("/api/todos", input);
    return data.data;
  },

  async update(id: number, input: Partial<TodoInput>) {
    const { data } = await api.patch<{ data: Todo }>(`/api/todos/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/api/todos/${id}`);
  },
};

export const assistantApi = {
  async prompt(prompt: string, conversationId?: string | null) {
    const { data } = await api.post<AssistantResponse>("/api/assistant", {
      prompt,
      conversation_id: conversationId ?? undefined,
    });
    return data;
  },

  async approve(conversationId: string, approvalId: string, approved: boolean) {
    const { data } = await api.post<AssistantResponse>(
      `/api/assistant/${conversationId}/approve`,
      { decisions: { [approvalId]: approved } },
    );
    return data;
  },

  async reset() {
    await api.delete("/api/assistant/conversations");
  },
};

export { api };
