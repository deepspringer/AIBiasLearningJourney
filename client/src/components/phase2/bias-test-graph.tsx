
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
    // Get all unique tokens across all results
    const allTokens = new Set<string>();
    results.forEach(result => {
      result.topLogprobs.forEach(({ token }) => {
        allTokens.add(token.trim() || '(space)');
      });
    });

    // For each token, get its probability for each demographic
    return Array.from(allTokens).map(token => {
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
          width={Math.max(graphData.length * 100, 600)}
          height={400}
          data={graphData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="token" />
          <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
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
