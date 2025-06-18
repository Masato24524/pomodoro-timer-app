import { BarChart, Bar, XAxis, YAxis } from "recharts";

function Chart() {
  // uv 縦軸、pv、amt
  const data = [
    { name: "6/12", uv: 4 },
    { name: "6/13", uv: 3 },
    { name: "6/14", uv: 3 },
    { name: "6/15", uv: 6 },
    { name: "6/16", uv: 3 },
    { name: "6/17", uv: 3 },
    { name: "6/18", uv: 5 },
  ];

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
    // Rechartsで棒グラフを作成
    <BarChart width={500} height={200} data={data}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis />
      <Bar
        dataKey="uv"
        barSize={30}
        fill="#8884d8"
        // label={renderCustomBarLabel}
      />
    </BarChart>
  );
}

export default Chart;
