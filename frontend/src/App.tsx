import "./App.css";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import Auth from "./component/Auth/Auth";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Timer from "./component/Timer/Timer";
import Chart from "./component/Chart/Chart";
import DateDoc from "./component/DateDoc/DateDoc";
import { useEffect, useState } from "react";
import type { dataType, fetchedDataResponse } from "./types/type";
import { confirmSession } from "./utils/confirmSession";
import { API_BASE_URL } from "./config/api";

const App = () => {
  const [login, setLogin] = useState(false);

  const handleLogin: () => void = () => {
    console.log("handle login!!!");
    console.log("login", login);

    setLogin(!login);
  };

  return (
    <AuthProvider handleLogin={handleLogin}>
      {login ? <MainApp /> : <Auth />}
    </AuthProvider>
  );
};

function MainApp() {
  const [events, setEvents] = useState();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isInputMenu, setIsInputMenu] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<null | fetchedDataResponse>(
    null
  );
  const [forceRerender, setForceRerender] = useState<number>(0); // メニューが閉じたあとの更新用
  const { logOut } = useAuth();

  // ページを開いた後の初回、月のデータを全件取得
  useEffect(() => {
    const fetchEvents = async () => {
      // JWTトークンからセッション情報を取得
      const session = await confirmSession();

      const response = await fetch(`${API_BASE_URL}/api/entries/`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const resJson = await response.json();
      // console.log(resJson);

      // return resJson;

      const dispAllData = resJson.data.map((day: dataType) => {
        const { doc_title: title, entry_date: start } = day;
        return { title, start };
      });
      console.log("dispAllData", dispAllData);
      setEvents(dispAllData);
    };

    fetchEvents();
  }, [forceRerender]);

  // 日付欄をクリックしたときの処理
  const handleDateClick = async (selectInfo: any) => {
    // console.log("selectInfo", selectInfo);

    const selectedDate: string = selectInfo.dateStr; // 日付の情報を取得
    // フェッチした日付の情報をAPIリクエストで送信
    const entryData = await fetchEntry(selectedDate);
    // console.log("entryData", entryData);
    setSelectedDate(selectedDate);
    setFetchedData(entryData);
    // console.log("fetchedData", fetchedData);

    // 入力メニューが閉じている場合、開く
    if (isInputMenu === false) {
      setIsInputMenu(!isInputMenu);
    }
  };

  // 選択した日付の情報を受け取ってAPIをフェッチする関数
  const fetchEntry = async (date: string) => {
    // JWTトークンからセッション情報を取得
    const session = await confirmSession();

    // ここで:date部分を指定
    const response = await fetch(`${API_BASE_URL}/api/entries/${date}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const resJson = (await response.json()) as fetchedDataResponse;
    // console.log("json_data", resJson);

    // データが無い場合は空データを挿入
    if (resJson.data === null) {
      return {
        data: { id: 0, entry_date: selectedDate, doc_title: "", doc_data: "" },
      };
    }

    return resJson;
  };

  // 画面更新のトリガー子コンポーネントから受け取る共通トリガー
  const handleRefreshChild = () => {
    setForceRerender((prev) => prev + 1);
  };

  // 保存ボタンの結果を子コンポーネントから受け取る
  const saveButtonChild = () => {
    setForceRerender((prev) => prev + 1);
  };

  // 閉じるボタンの結果を子コンポーネントから受け取る
  const toggleMenuChild = (value: boolean) => {
    console.log("value", value);
    setIsInputMenu(value);
  };

  // メニューが閉じた後に、レイアウトを更新
  useEffect(() => {
    if (!isInputMenu) {
      // 少し遅延の後、レイアウト更新
      const timer = setTimeout(() => {
        setForceRerender((prev) => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInputMenu]);

  return (
    <>
      <button className="button-logout" onClick={logOut}>
        ログアウト
      </button>
      <div className="app-container">
        <div className={`calendar-container ${isInputMenu ? "" : "close"}`}>
          <div className="calendar-days-section">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
              // contentHeight={"auto"}
              dateClick={handleDateClick}
              events={events}
            />
          </div>
          <div className={`datedoc-section ${isInputMenu ? "" : "close"}`}>
            <DateDoc
              fetchedData={fetchedData}
              saveButtonChild={saveButtonChild}
              menuClose={toggleMenuChild}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        <div className="pomodoro-container">
          <div className="timer-section">
            <Timer handleRefresh={handleRefreshChild} />
          </div>
          <div className="graph-section">
            <Chart rerenderTrigger={forceRerender} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
