
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

interface BiasTestResult {
  word: string;
  message: string;
  topLogprobs: Array<{ token: string; logprob: number }>;
}

interface BiasTestGraphProps {
  results: BiasTestResult[];
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c",
  "#d0ed57", "#83a6ed", "#8dd1e1", "#ff8042", "#ff6b81"
];

const BiasTestGraph = ({ results }: BiasTestGraphProps) => {
  const graphData = useMemo(() => {
    // Find tokens that were the highest probability for at least one demographic
    const significantTokens = new Set<string>();
    results.forEach(result => {
      if (result.topLogprobs.length > 0) {
        const highestProbToken = result.topLogprobs[0].token;
        significantTokens.add(highestProbToken.trim() || '(space)');
      }
    });

    // For each significant token, get its probability for each demographic
    return Array.from(significantTokens).map(token => {
      const dataPoint: Record<string, any> = { token };
      
      results.forEach(result => {
        const matchingProb = result.topLogprobs.find(lp => 
          (lp.token.trim() || '(space)') === token
        );
        dataPoint[result.word] = matchingProb 
          ? Math.exp(matchingProb.logprob) * 100 
          : 0;
      });
      
      return dataPoint;
    });
  }, [results]);

  if (results.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Token Probability Distribution</h3>
      <div className="w-full overflow-x-auto">
        <BarChart
          width={Math.max(graphData.length * 150, 600)}
          height={400}
          data={graphData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="token" />
          <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              paddingTop: "20px",
              borderTop: "1px solid #eee"
            }}
          />
          {results.map((result, index) => (
            <Bar
              key={result.word}
              dataKey={result.word}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </div>
    </div>
  );
};

export default BiasTestGraph;
