
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

interface SurveyProps {
  onPhaseChange: (phase: 1 | 2 | 3) => void;
}

const Survey = ({ onPhaseChange }: SurveyProps) => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [valuable, setValuable] = useState("");
  const [improvements, setImprovements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSliderChange = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      let surveyContent = "Survey Results:\n\n";
      
      // Add numeric responses
      questions.forEach(q => {
        const value = responses[q.id] || 3;
        const valueText = ["Not at all", "A little", "A moderate amount", "A lot", "A great deal"][value - 1];
        surveyContent += `${q.text}\nResponse: ${valueText} (${value}/5)\n\n`;
      });
      
      // Add text responses
      surveyContent += `What was valuable:\n${valuable || "No response"}\n\n`;
      surveyContent += `What could be improved:\n${improvements || "No response"}`;

      const response = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: "user",
          content: surveyContent,
          phase: 3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save survey results');
      }

      const data = await response.json();
      console.log('Survey saved:', data);
      alert("Thank you for your feedback!");
      onPhaseChange(2); // Return to phase 2
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Error submitting survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">What did you find valuable about the app?</label>
          <textarea
            value={valuable}
            onChange={(e) => setValuable(e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">What could be improved?</label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            className="w-full h-32 p-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Survey"}
      </button>
    </div>
  );
};

export default Survey;
