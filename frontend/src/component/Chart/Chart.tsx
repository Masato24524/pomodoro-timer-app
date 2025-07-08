import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

function Chart(rerenderTrigger:any) {
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
  useEffect(()=> {
    const fetchAllData = async() => {
      const response = await fetch(`/api/timer-routing/daily-time`);
      const result = await response.json();
      console.log("result", result)
  
      setData(result.data)
    }

    fetchAllData()
  },[rerenderTrigger])

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

  // 日付フォーマット関数
  const formatDate = (dateString: string):string => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1;
    const day = date.getDate()
    return `${month}月${day}日`
  }

  return (
    <div className="temp-container">
      {/* Rechartsで棒グラフを作成 */}
      <div className="chart-container">
        <BarChart width={400} height={200} data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickFormatter={formatDate}/>
          <YAxis 
            domain={[0, "dataMax"]}
            ticks={[0,1,2,3,4,5,6]}
            />
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
