import express from "express";
import { supabase } from "../config/supabase";

const router = express.Router();

// 特定の月のエントリーを全件取得
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("daily_entries").select("*");
    // console.log("allData", data);

    res.json({ data });
  } catch (error) {
    console.log("error:", error);
  }
});

// 特定の日付のエントリー取得
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    console.log("受信日付", date);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("entry_date", date)
      .single(); // 1件のみ取得

    console.log("data", data);
    console.log("error slected_date", error);

    res.json({ data });
    console.log("res sent");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entory" });
  }
});

// 特定のidのエントリーを更新
router.put("/:id", async (req, res) => {
  console.log("=== PUT リクエスト受信 ===");
  console.log("Body:", req.body);

  try {
    const { id } = req.params; // 分割代入でreq.paramsのdateを取り出し、entry_date変数に代入
    const { entry_date, doc_title, doc_data } = req.body;

    console.log("doc_title", doc_title);

    // supabaseのデータを更新、既存データが無ければ作成
    if (id === "0") {
      const { data, error } = await supabase
        .from("daily_entries")
        .insert({ entry_date, doc_title, doc_data })
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

      console.log("Supabaseレスポンス:");
      console.log("  data:", data);
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
