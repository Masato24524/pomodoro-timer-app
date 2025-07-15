import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { API_BASE_URL } from "../config/api";

interface AuthProviderProps {
  children: React.ReactNode;
  handleLogin: () => void;
}

interface AuthContextType {
  session: any;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  handleLogin,
}: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ログイン状態の監視
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("getSession:", session);

        if (session) {
          handleLogin();
        }
      } catch (err) {
        console.log("Auth initialization error:", err);
      } finally {
        setIsLoading(false); // 初期化完了
      }
    };
    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Sign up failed");
      }

      const data = await response.json();
      console.log("Singup data", data);
    } catch (error: any) {
      console.error("🚨 fetch自体のエラー:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    // 既にログイン済みの場合は処理しない
    if (user) {
      console.log("既にログイン済みです", user);
      handleLogin();
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log("singIn User", data.user);
    console.log("singIn Session data", data.session);

    if (!data.session) {
      alert("ログインできません");
    } else {
      setUser(data.user);
      setSession(data.session);

      // フロントエンドのSupabaseクライアントにセッションを設定
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      handleLogin();
    }
  };

  const logOut = async () => {
    console.log("logout");

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    handleLogin();
    return;
  };

  return (
    <AuthContext.Provider
      value={{ signUp, signIn, logOut, session, isLoading }}
    >
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
