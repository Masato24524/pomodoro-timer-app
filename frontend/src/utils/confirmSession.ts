import { supabase } from "../config/supabase";

// JWTトークンからセッション情報を取得
export async function confirmSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("ログインが必要です");
  }
  return session;
}
