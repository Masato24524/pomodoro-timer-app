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
import { confirmSession } from "./utils/confirmSession";
import { API_BASE_URL } from "./config/api";
import type { dataType, fetchedDataResponse } from "./types/type";
import type { EventInput } from "@fullcalendar/core"; // 公式型

const App = () => {
  const [login, setLogin] = useState(false);

  const handleLogin: () => void = () => {
    setLogin(!login);
  };

  return (
    <AuthProvider handleLogin={handleLogin}>
      {login ? <MainApp /> : <Auth />}
    </AuthProvider>
  );
};

function MainApp() {
  const [events, setEvents] = useState<EventInput[] | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isInputMenu, setIsInputMenu] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<null | fetchedDataResponse>(
    null
  );
  const [forceRerender, setForceRerender] = useState<number>(0); // メニューが閉じたあとの更新用
  const { isAuthenticated, logOut } = useAuth();

  // ページを開いた後の初回、月のデータを全件取得
  useEffect(() => {
    const fetchEvents = async () => {
      // 認証されていない場合は何もしない
      if (!isAuthenticated) {
        console.log("User not authenticated");
        return;
      }

      // JWTトークンからセッション情報を取得
      const session = await confirmSession();
      // console.log("App session first:", session);

      const response = await fetch(`${API_BASE_URL}/api/entries/`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const resJson = await response.json();
      // console.log("resJson_App", resJson);

      // return resJson;

      const dispAllData = resJson.data.map((day: dataType) => {
        const { id: id, doc_title: title, entry_date: start } = day;
        return { id, title, start };
      });
      // console.log("dispAllData", dispAllData);
      setEvents(dispAllData);
    };

    fetchEvents();
  }, [isAuthenticated, forceRerender]);

  // 日付欄の空欄部分をクリックしたときの処理（新規作成 id=0）
  const handleDateClick = async (selectInfo: any) => {
    // console.log("selectInfo", selectInfo);

    const selectedDate: string = selectInfo.dateStr; // 日付の情報を取得

    // 空のentryDataを作成
    const entryData = {
      data: {
        id: 0,
        // uid: user_id,
        entry_date: selectedDate,
        doc_title: "",
        doc_data: "",
      },
    };

    // console.log("entryData", entryData);
    setSelectedDate(selectedDate);
    setFetchedData(entryData);
    // console.log("fetchedData_newEntry", fetchedData);

    // 入力メニューが閉じている場合、開く
    if (isInputMenu === false) {
      setIsInputMenu(!isInputMenu);
    }
  };

  // 新規作成した記事のID,Title,Contentに更新するコールバック関数
  const updateNewEntry = (
    newId: number,
    newTitle: string,
    newContent: string
  ) => {
    setFetchedData((prev) => ({
      ...prev!,
      data: {
        ...prev!.data,
        id: newId,
        doc_title: newTitle,
        doc_data: newContent,
      },
    }));
  };

  // 日付欄の各エントリーをクリックしたときの処理
  const handleEventClick = async (info: any) => {
    // クリックされた要素の情報を取得
    const clickedEvent = info.event;

    // 日付を整形する
    const convertDate = (date: any) => {
      return new Date(date).toLocaleDateString("sv-SE"); // yyyy-mm-dd形式になる
    };
    const selectedDate: string = convertDate(clickedEvent.start); // 日付の情報を取得
    // console.log(selectedDate);

    // フェッチした日付の情報をAPIリクエストで送信
    const entryData = await fetchEntryId(clickedEvent.id);
    // console.log("entryData", entryData);
    setSelectedDate(selectedDate);
    setFetchedData(entryData);

    // 入力メニューが閉じている場合、開く
    if (isInputMenu === false) {
      setIsInputMenu(!isInputMenu);
    }
  };

  // 選択したevent日付のidを受け取ってフェッチする関数
  const fetchEntryId = async (id: string) => {
    // JWTトークンからセッション情報を取得
    const session = await confirmSession();

    // ここで:id部分を指定
    const response = await fetch(`${API_BASE_URL}/api/entries/entry/${id}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const resJson = (await response.json()) as fetchedDataResponse;

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
              eventClick={handleEventClick}
            />
          </div>
          <div className={`datedoc-section ${isInputMenu ? "" : "close"}`}>
            <DateDoc
              fetchedData={fetchedData}
              saveButtonChild={saveButtonChild}
              menuClose={toggleMenuChild}
              selectedDate={selectedDate}
              updateNewEntry={updateNewEntry}
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
