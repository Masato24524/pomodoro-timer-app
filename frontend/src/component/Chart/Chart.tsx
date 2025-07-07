import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

function Chart() {
  // uv 縦軸、pv、amt
  // const data = [
  //   { name: "6/12", uv: 4 },
  //   { name: "6/13", uv: 3 },
  //   { name: "6/14", uv: 3 },
  //   { name: "6/15", uv: 6 },
  //   { name: "6/16", uv: 3 },
  //   { name: "6/17", uv: 3 },
  //   { name: "6/18", uv: 5 },
  // ];

  const [data, setData] = useState([])

  // Supabaseのデータを取得
  const fetchAllData = async() => {
    const response = await fetch(`/api/timer-routing/daily-time`);
    const result = await response.json();
    console.log("result", result)

    const dailyTimes = result.data.map((item:any) => ({
      name: item.task_date,
      uv: item.total_hours
    }))

    console.log(dailyTimes)
    setData(dailyTimes)
  }

  // バーのラベルを表示する関数
  // const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
  //   return (
  //     <text
  //       x={x + width / 2}
  //       y={y}
  //       fill="#666"
  //       textAnchor="middle"
  //       dy={-6}
  //     >{`value: ${value}`}</text>
  //   );
  // };

  return (
    <div className="temp-container">
      <button onClick={fetchAllData}>更新</button>
      {/* Rechartsで棒グラフを作成 */}
      <div className="chart-container">
        <BarChart width={400} height={200} data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Bar
            dataKey="uv"
            barSize={30}
            fill="#8884d8"
            // label={renderCustomBarLabel}
          />
        </BarChart>
      </div>
    </div>

  );
}

export default Chart;
