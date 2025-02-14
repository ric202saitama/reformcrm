import { useState } from "react";
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  isLogin: boolean;
  userName: string;
  setLogin: (state: boolean) => void;
  setUserName: (name: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userName, setUserName] = useState("");

  const setLogin = (state: boolean) => {
    setIsLogin(state);
  };

  return (
    <AuthContext.Provider value={{ isLogin, userName, setLogin, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
