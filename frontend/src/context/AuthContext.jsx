import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService.tryRestoreSession().then((u) => {
      if (cancelled) return;
      setUser(u);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const u = await authService.login({ email, password });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const u = await authService.register({ name, email, password });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const u = await authService.updateMe(patch);
    setUser(u);
    return u;
  }, []);

  const value = {
    user,
    ready,
    isAuthed: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
