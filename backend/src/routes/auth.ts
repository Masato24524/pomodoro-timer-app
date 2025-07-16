import express from "express";
import { createSupabaseClient } from "../config/supabase";

const router = express.Router();

// サインアップ
router.post("/signup", async (req, res) => {
  // 各モジュールごとにsupabaseインスタンスを作成する
  const supabase = createSupabaseClient();

  console.log("req.body", req.body);
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // console.log("- data:", data);
    console.log("- error:", error);

    if (error) {
      res.status(401).json({ error: error.message });
    }

    if (!data.session) {
      try {
        res.status(200).json({
          message:
            "確認メールを送信しました。メールをチェックしてアカウントを確認してください。",
          user: data.user,
          session: null,
          requiresEmailConfirmation: true,
        });
      } catch (resError) {
        console.error(" res.json()エラー:", resError);
      }
    } else {
      console.log("✅ 成功レスポンス送信");
      res.status(201).json({
        message: "User created succesfully",
        user: data.user,
        session: data.session,
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// サインイン
router.post("/signin", async (req, res) => {
  // 各モジュールごとにsupabaseインスタンスを作成する
  const supabase = createSupabaseClient();

  // console.log("signin");
  // console.log("req.body", req.body);
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signin error", error);

    // Supabaseの認証エラーをチェック
    if (error) {
      res.status(401).json({
        error: "Authentication failed",
        details: error.message,
      });
      return;
    } else {
      res.status(200).json({
        message: "Login successful",
        user: data.user,
        session: data.session,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// サインアウト
router.post("/signout", async (req, res) => {
  // 各モジュールごとにsupabaseインスタンスを作成する
  const supabase = createSupabaseClient();

  await supabase.auth.signOut();

  res.status(200).json({
    message: "Logout successful",
  });
});

export default router;
