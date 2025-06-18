import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import Timer from "./component/Timer/Timer";
import Chart from "./component/Chart/Chart";
import DateDoc from "./component/DateDoc/DateDoc";

function App() {
  const handleDateClick = (selectInfo: any) => {
    console.log(selectInfo);
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="about" element={<DateDoc />} />
        </Routes>
      </BrowserRouter>

      <div className="app-container">
        <div className="calendar-section">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="500px"
            dateClick={handleDateClick}
          />
        </div>
        <div className="pomodoro-section">
          <div className="timer-section">
            <Timer />
          </div>
          <div className="graph-section">
            <Chart />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
