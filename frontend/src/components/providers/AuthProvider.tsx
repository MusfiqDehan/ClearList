"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, profileApi } from "@/lib/api";
import type { ProfileInput, User } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    authApi
      .user()
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => setStatus("guest"));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async login(email, password, remember) {
        const currentUser = await authApi.login(email, password, remember);
        setUser(currentUser);
        setStatus("authenticated");
        return currentUser;
      },
      async register(name, email, password, passwordConfirmation) {
        const currentUser = await authApi.register(
          name,
          email,
          password,
          passwordConfirmation,
        );
        setUser(currentUser);
        setStatus("authenticated");
        return currentUser;
      },
      async logout() {
        await authApi.logout();
        setUser(null);
        setStatus("guest");
      },
      async updateProfile(input) {
        const currentUser = await profileApi.update(input);
        setUser(currentUser);
        return currentUser;
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
