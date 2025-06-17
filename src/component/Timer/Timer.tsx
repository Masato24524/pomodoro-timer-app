import { useEffect, useState } from "react";
import "./Timer.css";

const Timer = () => {
  const [totalSec, setTotalSec] = useState(25 * 60);

  const minTime = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const secTime1 = Math.floor(seconds / 10); //秒の十の位
  const secTime2 = seconds % 10; //秒の一の位

  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!start) return;

    const countDown = setInterval(() => {
      setTotalSec((prevSec) => prevSec - 1);
    }, 1000);

    return () => clearInterval(countDown);
  }, [start]);

  return (
    <div>
      <div className="timer-display">
        {minTime}:{secTime1}
        {secTime2}
      </div>
      <button onClick={() => setStart(true)}>Start</button>
      <button>Stop</button>
      <button>Reset</button>
    </div>
  );
};

export default Timer;
