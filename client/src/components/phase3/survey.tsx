
import { useState } from "react";

interface SurveyQuestion {
  id: string;
  text: string;
}

const questions: SurveyQuestion[] = [
  { id: "reading", text: "Overall, how valuable was the reading to you?" },
  { id: "readingChat", text: "Overall, how valuable was the AI chat about the reading to you?" },
  { id: "experimenting", text: "Overall, how valuable was the experimenting to you?" },
  { id: "experimentingChat", text: "Overall, how valuable was the AI chat about the experimenting to you?" },
  { id: "conclusionWriting", text: "Overall, how valuable was the conclusion writing to you?" },
  { id: "conclusionChat", text: "Overall, how valuable was the AI chat about the conclusion writing to you?" }
];

const Survey = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});

  const handleSliderChange = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Survey</h2>
      {questions.map((question) => (
        <div key={question.id} className="space-y-4">
          <p className="text-gray-700">{question.text}</p>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={responses[question.id] || 3}
              onChange={(e) => handleSliderChange(question.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 Not at all</span>
              <span>2 A little</span>
              <span>3 A moderate amount</span>
              <span>4 A lot</span>
              <span>5 A great deal</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Survey;
