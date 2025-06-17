import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "./App.css";
import Timer from "./component/Timer/Timer";
import Graph from "./component/gragh";

function App() {
  return (
    <div className="app-container">
      <div className="calendar-section">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="500px"
        />
      </div>
      <div className="pomodoro-section">
        <div className="timer-section">
          <Timer />
        </div>
        <div className="graph-section">
          <Graph />
        </div>
      </div>
    </div>
  );
}

export default App;
