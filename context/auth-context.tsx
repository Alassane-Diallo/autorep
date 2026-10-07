import { LoginType, RegisterType, UserResponse } from "@/lib/type";
import api from "@/services/api";
import { TokenService } from "@/services/storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

// --- TYPES ---
type AuthContextType = {
  user: UserResponse | null;
  isLoading: boolean;
  login: (data: LoginType) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterType) => Promise<void>;
}

// --- CONTEXT ---
const AuthContext = createContext<AuthContextType | null>(null);

// --- PROVIDER ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifie si un token existe au démarrage de l'app
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await TokenService.getAccessToken();

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Récupère les infos du user depuis l'API
      const response = await api.get("/api/auth/me");
      setUser(response.data.data);

    } catch {
      // Token invalide ou expiré — nettoyage
      await TokenService.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIN ---
  const login = async (data: LoginType) => {
    try {
      const response = await api.post("/api/auth/login", data);
      const { user, access, refresh } = response.data.data;

      await TokenService.saveTokens(access, refresh);
      setUser(user);

      // Redirection selon le rôle
      redirectByRole(user.role);

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur de connexion.");
    }
  };

  // --- REGISTER ---
  const register = async (data: RegisterType) => {
    try {
      const response = await api.post("/api/auth/register", data);
      const { user, access, refresh } = response.data.data;

      await TokenService.saveTokens(access, refresh);
      setUser(user);

      redirectByRole(user.role);

    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      await TokenService.clearTokens();
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  // --- REDIRECTION SELON LE ROLE ---
  const redirectByRole = (role: string) => {
    switch (role) {
      case "CLIENT":
        router.replace("/(client)");
        break;
      case "TECHNICIEN":
        router.replace("/(technicien)");
        break;
      case "ADMIN":
        router.replace("/(admin)");
        break;
      default:
        router.replace("/(auth)/login");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --- HOOK ---

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext doit être utilisé dans AuthProvider");
  return context;
}