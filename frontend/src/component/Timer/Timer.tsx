import "./Timer.css";

import { useEffect, useState } from "react";

const Timer = () => {
  // 時間を1500秒として保持する
  const [totalSec, setTotalSec] = useState(25 * 60);

  const minTime = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const secTime1 = Math.floor(seconds / 10); //秒の十の位
  const secTime2 = seconds % 10; //秒の一の位

  const [start, setStart] = useState(false);

  const stopTimer = () => {
    setStart(false);
  };

  const resetTimer = () => {
    setTotalSec(25 * 60);
  };

  useEffect(() => {
    if (!start) return;

    // totalSecを1秒ずつ減らす
    const countDown = setInterval(() => {
      setTotalSec((prevSec) => prevSec - 1);
    }, 1000);

    return () => clearInterval(countDown);
  }, [start]);

  return (
    <div className="timer-container">
      <div className="timer-display">
        {minTime}:{secTime1}
        {secTime2}
      </div>
      <div className="timer-button">
        <button onClick={() => setStart(true)}>Start</button>
        <button onClick={stopTimer}>Stop</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
};

export default Timer;
