import { API_BASE_URL } from "../../config/api";
import { confirmSession } from "../../utils/confirmSession";
import "./Timer.css";

import { useEffect, useState } from "react";

interface SubTasks {
  subtask_name: string;
  subtask_totalTime: number; // サブタスクの一つの項目のトータル時間
}

const Timer = ({ handleRefresh }: { handleRefresh: () => void }) => {
  // 時間を1500秒として保持する
  const pomodoroTime: number = 25 * 60;

  const [totalSec, setTotalSec] = useState<number>(pomodoroTime); // ポモドーロタイマーのセット時間
  const [startTime, setStartTime] = useState<any>(null); // タイマーの開始時刻を監視する
  const [start, setStart] = useState(false);
  const [totalPausedTime, setTotalPausedTime] = useState(0); // 累積一時停止時間
  const [pauseStartTime, setPauseStartTime] = useState<any>(null); // タイマーの一時停止を監視する
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

        const response = await fetch(`${API_BASE_URL}/api/timer-routing/`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const resJson = await response.json();
        // console.log("resJson of getSubTask", resJson);

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

  // タイマーをスタートする
  const startTimer = () => {
    // タスクが選択されていない場合はアラート
    if (selectedSubTask === "タスクを選んでください") {
      alert("サブタスクが選択されていません");
      return;
    } else {
      // 一時停止時間がある場合、その時間を累積する
      if (pauseStartTime) {
        const pauseDuation = Math.floor((Date.now() - pauseStartTime) / 1000);
        // console.log("pauseDuation", pauseDuation);
        setTotalPausedTime((prev: any) => prev + pauseDuation);

        setPauseStartTime(null); // 一時停止開始時間をリセット
        setStart(true);
      }

      if (!startTime) {
        const now = Date.now();
        setStartTime(now); // タイマーの開始時間を記録する

        setStart(true); // タイマーを開始する
      } else {
        console.log("Timer resumed");
      }
    }
  };

  // タイマーの時間を更新する
  useEffect(() => {
    if (!start || !startTime) return;

    // タイマーの開始時間と現在時間を比較して、totalSecを更新する（1秒毎）
    const countDown = setInterval(() => {
      const now = Date.now();

      const totalElapsed = Math.floor((now - startTime) / 1000);
      // console.log("totalElapsed", totalElapsed);
      const activeElapased = Math.max(0, totalElapsed - totalPausedTime);
      // console.log("totalPausedTime", totalPausedTime);

      const remaining = Math.max(0, pomodoroTime - activeElapased);
      // console.log("timerTime", remaining);
      setTotalSec(remaining);

      // 0になったらタイマー停止
      if (remaining === 0) {
        // setIntervalをクリアー
        clearInterval(countDown);

        //少し遅延をはさんでからアラート表示
        setTimeout(() => {
          stopTimer(remaining);
          alert("ポモドーロタイムが完了しました！");
        }, 100);

        return;
      }
    }, 1000);

    return () => clearInterval(countDown);
  }, [start, startTime]);

  // タイマーを一時停止する
  const pauseTimer = () => {
    const now = Date.now();
    setPauseStartTime(now);
    setStart(false);
  };

  // API呼び出し前にサーバーを起こす
  const wakeUpServer = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
        // タイムアウトを短く設定
        signal: AbortSignal.timeout(5000),
      });
      // 仮の表示（今後、メッセージ表示を実装する）
    } catch (error) {
      console.log("Server wake-up attempt", error);
      alert("サーバー起動中です。少し待つと実行されます。");
    }
  };

  // タイマーの停止（選択されたサブタスクを、新規ポモドーロタイムと合わせて追加する）
  const stopTimer = async (passedTime: number) => {
    // console.log("passedTime", passedTime);

    if (selectedSubTask === "タスクを選んでください")
      return alert("サブタスクが選択されていません");

    await wakeUpServer();

    const registerTime = async () => {
      // if (passedTime === pomodoroTime) return;

      //データベース登録用の時間を整形
      const date = new Date();
      // console.log("date:", date);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;
      // console.log("localDate", localDate);

      const formattedTime: string = date.toTimeString().split(" ")[0];
      const timeZone: string = "09:00";

      const createTimestamp = (date: string, time: string): string => {
        const jstTimestamp: string = `${date}T${time}+${timeZone}`;
        // console.log("start_time:", jstTimestamp);
        return new Date(jstTimestamp).toISOString(); // UTC時間に変換
      };

      const register_time_data = {
        subtask_name: selectedSubTask,
        start_time: createTimestamp(localDate, formattedTime), // UTC時間で登録
        task_time: pomodoroTime - passedTime,
      };
      // console.log("更新するサブタスク情報", register_time_data);

      try {
        // JWTトークンからセッション情報を取得
        const session = await confirmSession();

        const response = await fetch(
          `${API_BASE_URL}/api/timer-routing/${selectedSubTask}`,
          {
            method: "post",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(register_time_data),
          }
        );
        const resJson = await response.json();
        // console.log("更新したsubtaskの情報:", resJson);

        resetTimerState();

        return resJson;
      } catch (err) {
        console.log("err", err);
      }
    };

    const resetTimerState = () => {
      setStart(false);
      setStartTime(null);
      setPauseStartTime(null); // 一時停止開始時間をリセット
      setTotalPausedTime(0); // 累積一時定時間をリセット
      setTotalSec(pomodoroTime);
      setIsGetSubTask(true);
      handleRefresh();
    };
    // console.log("pomodoroTime", pomodoroTime);

    if (passedTime === pomodoroTime) {
      // passedTimeが減っていないときはデータベース登録しない
      resetTimerState();
    } else {
      registerTime();
    }
  };

  // サブタスクの入力欄の更新を保持する
  const inputed_subtask = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSubTaskName(e.target.value);
    // console.log(inputSubTask);
  };

  // プラスボタンを押したときに、サブタスクを項目を登録する。
  // ただし名称が重複していないこと
  const addSubTask = async () => {
    if (!inputSubTaskName) return alert("サブタスク名が入力されていません");

    // console.log(inputSubTaskName);
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
      const response = await fetch(`${API_BASE_URL}/api/timer-routing/`, {
        method: "put",
        headers: {
          Authorization: `Bearer ${session.access_token}`, // ヘッダーにアクセストークを付与する
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addSubTaskData),
      });

      const resJson = await response.json();
      // console.log("登録したsubtaskの情報:", resJson);

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
      const response = await fetch(
        `${API_BASE_URL}/api/timer-routing/${value}`,
        {
          method: "delete",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
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

  // 画面切り替え時のスリープ対策
  // 検証用ログ
  // useEffect(() => {
  //   let intervalId = null;

  //   if (start) {
  //     console.log("Timer started at:", new Date().toISOString());
  //     console.log("Page visible", document.visibilityState);

  //     intervalId = setInterval(() => {
  //       const now = new Date();
  //       console.log(
  //         `Timer tick ${now.toISOString()} , Page: ${document.visibilityState}`
  //       );

  //       setTotalSec((prev: any) => {
  //         console.log(`Time update: ${prev} -> ${prev - 1}`);
  //         if (prev <= 1) {
  //           console.log("Timer completed");
  //         }

  //         return prev - 1;
  //       });
  //     }, 1000);
  //   }
  // }, [start]);

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
        <button onClick={startTimer}>Start</button>
        <button onClick={pauseTimer}>Pause</button>
        <button onClick={() => stopTimer(totalSec)}>Stop</button>
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
