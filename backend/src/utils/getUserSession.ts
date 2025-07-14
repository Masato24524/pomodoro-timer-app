import { supabase } from "../config/supabase";
import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";

// JWTトークンからユーザー情報を取得
export async function getUserSession(
  req: Request,
  res: Response
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser(
    req.headers.authorization?.replace("Bearer ", "")
  );
  // console.log("user:", user);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
  }

  return user;
}
