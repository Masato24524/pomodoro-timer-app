import { confirmSession } from "../../utils/confirmSession";
import "./Timer.css";

import { useEffect, useState } from "react";

interface SubTasks {
  subtask_name: string;
  subtask_totalTime: number; // サブタスクの一つの項目のトータル時間
}

const Timer = ({ handleRefresh }: { handleRefresh: () => void }) => {
  // 時間を1500秒として保持する
  const [totalSec, setTotalSec] = useState(25 * 60); // ポモドーロタイマーのセット時間
  const [start, setStart] = useState(false);
  const [inputSubTaskName, setInputSubTaskName] = useState<string>("");
  const [currentSubTasks, setCurrentSubTasks] = useState<SubTasks[]>([]);
  const [selectedSubTask, setSelectedSubTask] =
    useState<string>("タスクを選んでください");
  const [isGetSubTask, setIsGetSubTask] = useState(false); // getSubTaskのトリガー

  // 現在の登録サブタスク名およびトータル時間を表示する
  useEffect(() => {
    const getSubTask = async () => {
      try {
        // JWTトークンからセッション情報を取得
        const session = await confirmSession();

        const response = await fetch(`/api/timer-routing/`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const resJson = await response.json();
        console.log("resJson of getSubTask", resJson);

        const subTasks: SubTasks[] = resJson.data.map((item: any) => ({
          subtask_name: item.subtask_name,
          subtask_totalTime: item.subtask_totaltime,
        }));

        setCurrentSubTasks(subTasks);
      } catch (err) {
        console.log("err", err);
      }
    };

    getSubTask();

    setIsGetSubTask(false); // トリガーをfalseにする
  }, [isGetSubTask]);

  useEffect(() => {
    // console.log("updated currentSubTasks:", currentSubTasks);
  }, [currentSubTasks]);

  const minTime = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const secTime1 = Math.floor(seconds / 10); //秒の十の位
  const secTime2 = seconds % 10; //秒の一の位

  // タイマーを更新するサブタスクを選択する
  const select_subtask = (e: any) => {
    const selected_subtask = e.currentTarget.textContent;
    // console.log("e", e.currentTarget.textContent);
    setSelectedSubTask(selected_subtask);
  };

  // タイマーの時間を更新する
  useEffect(() => {
    if (!start) return;

    // totalSecを1秒ずつ減らす
    const countDown = setInterval(() => {
      setTotalSec((prevSec) => prevSec - 1);
    }, 1000);

    return () => clearInterval(countDown);
  }, [start]);

  // タイマーを一時停止する
  const pauseTimer = () => {
    setStart(false);
  };

  // タイマーの停止（選択されたサブタスクを、新規ポモドーロタイムと合わせて追加する）
  const stopTimer = () => {
    const register_time = async () => {
      const date = new Date();
      console.log("date:", date);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;
      console.log("localDate", localDate);

      const formattedTime: string = date.toTimeString().split(" ")[0];
      const timeZone: string = "09:00";

      const createTimestamp = (date: string, time: string): string => {
        const jstTimestamp: string = `${date}T${time}+${timeZone}`;
        console.log("start_time:", jstTimestamp);
        return new Date(jstTimestamp).toISOString(); // UTC時間に変換
      };

      const register_time_data = {
        subtask_name: selectedSubTask,
        start_time: createTimestamp(localDate, formattedTime), // UTC時間で登録
        task_time: 25 * 60 - totalSec,
      };
      console.log("更新するサブタスク情報", register_time_data);

      try {
        // JWTトークンからセッション情報を取得
        const session = await confirmSession();

        const response = await fetch(`/api/timer-routing/${selectedSubTask}`, {
          method: "post",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(register_time_data),
        });
        const resJson = await response.json();
        console.log("更新したsubtaskの情報:", resJson);
      } catch (err) {
        console.log("err", err);
      }
    };

    register_time();
    pauseTimer();
    resetTimer();
    setIsGetSubTask(true);
    handleRefresh();
  };

  // タイマーをリセットする
  const resetTimer = () => {
    setTotalSec(25 * 60);
  };

  // サブタスクの入力欄の更新を保持する
  const inputed_subtask = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSubTaskName(e.target.value);
    // console.log(inputSubTask);
  };

  // プラスボタンを押したときに、サブタスクを項目を登録する。
  // ただし名称が重複していないこと
  const addSubTask = async () => {
    console.log(inputSubTaskName);
    try {
      // JWTトークンからセッション情報を取得
      const session = await confirmSession();

      // 追加したいデータを定義
      const addSubTaskData = {
        subtask_name: inputSubTaskName,
        start_time: null,
        task_time: 0,
      };

      // console.log("登録するsubtask:", addSubTaskData);

      // データを追加する
      const response = await fetch(`/api/timer-routing/`, {
        method: "put",
        headers: {
          Authorization: `Bearer ${session.access_token}`, // ヘッダーにアクセストークを付与する
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addSubTaskData),
      });

      const resJson = await response.json();
      console.log("登録したsubtaskの情報:", resJson);

      if (resJson.success) {
        if (resJson.action === "created") {
          // 新しいアイテムを配列に追加（ここで再レンダリングされる）
          const newSubTasks = {
            subtask_name: resJson.data.subtask_name,
            subtask_totalTime: 0,
          };
          setCurrentSubTasks((prev) => [...prev, newSubTasks]);
        } else if (resJson.action === "no change") {
          // 既に存在する場合
          alert("既に同じ名前のサブタスクが存在します");
        }
      }

      // if (error) {
      //   console.error(error);
      // }
    } catch (err) {
      console.error(err);
    }
  };

  // 登録済みのサブタスクを削除する(value = subtask_name)
  // 削除確認のポップアップ
  const confirmDeleteSubtask = (value: string) => {
    if (window.confirm("このサブタスクを削除しますか？")) {
      deleteSubtask(value);
    }
  };

  // 実際の削除処理
  const deleteSubtask = async (value: any) => {
    console.log(value);

    try {
      // JWTトークンからセッション情報を取得
      const session = await confirmSession();

      // サブタスクの削除
      const response = await fetch(`/api/timer-routing/${value}`, {
        method: "delete",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const resJson = await response.json();

      if (resJson.success) {
        // 新しいアイテムを配列から削除（ここで再レンダリングされる）
        const deleteSubTaskName = resJson.data.subtask_name;
        setCurrentSubTasks((prev) =>
          prev.filter((task) => task.subtask_name !== deleteSubTaskName)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="timer-container">
      <div className="selected-subtask">
        {" "}
        <div className="selected-subtask-name">{selectedSubTask}</div>
        <div className="selected-subtask-totalTime">
          {
            currentSubTasks.find(
              (task) => task.subtask_name === selectedSubTask
            )?.subtask_totalTime
          }
          {selectedSubTask === "タスクを選んでください" ? "" : "hr"}
        </div>
      </div>

      <div className="timer-display">
        {minTime}:{secTime1}
        {secTime2}
      </div>
      <div className="timer-button">
        <button onClick={() => setStart(true)}>Start</button>
        <button onClick={pauseTimer}>Pause</button>
        <button onClick={stopTimer}>Stop</button>
      </div>
      <div className="day-tasks">
        <div className="add-task">
          <button onClick={addSubTask}>+</button>
          <input
            type="text"
            onChange={inputed_subtask}
            placeholder="サブタスクを追加する"
          />
        </div>
        <div className="sub-tasks">
          {currentSubTasks.map((task) => {
            return (
              <div className="sub-task-buttons" key={task.subtask_name}>
                <button className="sub-task-items" onClick={select_subtask}>
                  {task.subtask_name}
                </button>
                <div className="sub-task-totaltime">
                  {task.subtask_totalTime}hr
                </div>
                {/* サブタスクの削除ボタン */}
                <button
                  className="delete-subtask"
                  onClick={() => confirmDeleteSubtask(task.subtask_name)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timer;
