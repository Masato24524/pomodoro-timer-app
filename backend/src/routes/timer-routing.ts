import express from "express";
import { supabase } from "../config/supabase";

const router = express.Router();

// 登録済みのサブタスク名およびトータル時間の取得
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("sum_task_times"); //SQL Editorで作成した関数を呼び出す

    console.log("data_subtasks:", data);
    // console.log("error_subtasks:", error);

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// サブタスクの時間を日付ごとに取得
router.get("/daily-time", async( req, res) => {
  const date = new Date()
  const isoDate: string = date.toISOString().split("T")[0];  // "2025-07-08"
  console.log(isoDate)

  const baseDate = new Date(isoDate)
  const twoWeeksAgo = new Date(baseDate.getTime()-(13 * 24 * 60 * 60 * 1000))
  const isoTwoWeeksAgo: string = twoWeeksAgo.toISOString().split("T")[0];
  console.log(isoTwoWeeksAgo)

  try {
    const { data, error } = await supabase.rpc("sum_task_daily_times", {
      start_date: isoTwoWeeksAgo, // 仮指定 "2025-01-01"
      end_date: isoDate, // 仮指定 "2025-01-01"
      timezone_name: "Asia/Tokyo"
    })
    console.log("daily-time:",data)
    console.log("  error:", error);
    res.status(200).json({
      success: true,
      data: data
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal server error'})
  }

})

// 新たにサブタスクを登録する。ただし名称の重複がないこと。
router.put("/", async (req, res) => {
  try {
    const { subtask_name, subtask_date, start_time, task_time } = req.body;

    // 既にサブタスクの名称が存在するかチェック
    const { data: existingTasks, error: checkError } = await supabase
      .from("sub_tasks")
      .select("*")
      .eq("subtask_name", subtask_name);

    if (existingTasks && existingTasks.length > 0) {
      console.log("message: 既にサブタスクが存在しています");
      res.status(200).json({
        success: true,
        action: "no change",
        error: "Subtask already exists, no action taken",
      });
    } else {
      const { data, error } = await supabase
        .from("sub_tasks")
        .insert({ subtask_name, subtask_date, start_time, task_time })
        .select();

      console.log("  error:", error); 

      res.status(200).json({
        success: true,
        action: "created",
        data: data ? data[0] : null,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 登録済のサブタスクを削除する
router.delete("/:subtask_name", async (req, res) => {
  try {
    const { subtask_name } = req.params;
    const { data, error } = await supabase
      .from("sub_tasks")
      .delete()
      .eq("subtask_name", subtask_name)
      .select();

    console.log("  error:", error);

    res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
      data: data ? data[0] : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 選択したサブタスクの時間を登録
router.post("/:subtask_name", async (req, res) => {
  try {
    const { subtask_name } = req.params;
    const { subtask_date, start_time, task_time } = req.body;

    // 選択したサブタスクの時間を登録する
    const { data, error } = await supabase
      .from("sub_tasks")
      .insert({ subtask_name, subtask_date, start_time, task_time })
      .select();

    console.log("  error:", error);

    // resを返す
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
