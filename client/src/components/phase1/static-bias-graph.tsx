
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  {
    token: 'bad',
    Asian: 75.565,
    White: 0,
    Black: 0,
    Latino: 0
  },
  {
    token: 'soc',
    Asian: 1.078,
    White: 73.059,
    Black: 0.033,
    Latino: 99.997
  },
  {
    token: 'basket',
    Asian: 13.131,
    White: 16.302,
    Black: 99.518,
    Latino: 0
  }
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const StaticBiasGraph = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Token Probability Distribution</h3>
      <div className="w-full overflow-x-auto">
        <BarChart
          width={600}
          height={400}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="token" />
          <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {Object.keys(data[0]).slice(1).map((key, index) => (
            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </div>
    </div>
  );
};

export default StaticBiasGraph;
