import express from "express";
import { supabase } from "../config/supabase";
import { getUserSession } from "../utils/getUserSession";

const router = express.Router();

// 特定の月のエントリーを全件取得
router.get("/", async (req, res) => {
  // console.log("req entries data all", req);
  try {
    // JWTトークンからユーザー情報を取得
    const user = await getUserSession(req, res); // セッション情報をrequestで受け取っている
    // console.log("entries data all user:", user);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("uid", user?.id);
    // console.log("allData", data);

    res.json({ data });
  } catch (error) {
    console.log("error:", error);
  }
});

// 特定の日付のエントリー取得
router.get("/:date", async (req, res) => {
  try {
    // JWTトークンからユーザー情報を取得
    const user = await getUserSession(req, res);

    const { date } = req.params;
    // console.log("受信日付", date);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("entry_date", date)
      .eq("uid", user?.id)
      .single(); // 1件のみ取得

    // console.log("data", data);
    console.log("error slected_date", error);

    res.json({ data });
    // console.log("res sent");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entory" });
  }
});

// 特定のidのエントリーを更新
router.put("/:id", async (req, res) => {
  // console.log("=== PUT リクエスト受信 ===");
  // console.log("Body:", req.body);

  try {
    const { id } = req.params; // 分割代入でreq.paramsのdateを取り出し、entry_date変数に代入
    const { entry_date, doc_title, doc_data } = req.body;

    // JWTトークンからユーザー情報を取得
    const user = await getUserSession(req, res);

    // console.log("doc_title", doc_title);

    // supabaseのデータを更新、既存データが無ければ作成
    if (id === "0") {
      const { data, error } = await supabase
        .from("daily_entries")
        .insert({ uid: user?.id, entry_date, doc_title, doc_data })
        .select();

      // レスポンスを返す
      res.status(201).json({
        success: true,
        data: data ? data[0] : null,
      });
    } else {
      const { data, error } = await supabase
        .from("daily_entries")
        .update({
          doc_title,
          doc_data,
        })
        .eq("id", id);

      // console.log("Supabaseレスポンス:");
      // console.log("  data:", data);
      console.log("  error:", error);

      // レスポンスを返す
      res.status(201).json({
        success: true,
        data: data ? data[0] : null,
      });
    }
  } catch (error) {
    // res.status(500).json({ error: error.message });
    const errorMessage = String(error);
  }
});

export default router;
