import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { Alert } from "react-native";
import authService from "@/services/authService";
import apiService from "@/services/apiService";

type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
};

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    companyCode: string,
    username: string,
    password: string
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in when app starts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (
    companyCode: string,
    username: string,
    password: string
  ) => {
    try {
      const response = await authService.login(companyCode, username, password);

      if (response.error) {
        return { error: response.error };
      }

      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An unexpected error occurred during login" };
    }
  };

  // Logout function - Wrap with useCallback
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout failed", "An error occurred while logging out");
    }
  }, []);

  // Setup apiService with the context's logout function
  useEffect(() => {
    apiService.setup(logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
