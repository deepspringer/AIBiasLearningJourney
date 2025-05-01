import { useState } from "react";

const ConclusionWriter = () => {
  const [conclusion, setConclusion] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConclusion = async () => {
    if (!conclusion.trim()) {
      alert("Please write a conclusion before saving.");
      return;
    }

    setIsSaving(true);

    try {
      const userId = localStorage.getItem('userId');
      console.log("[Client] Sending conclusion with userId:", userId);
      
      const response = await fetch("/api/save-conclusion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          conclusion,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save conclusion");
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Error saving conclusion:", error);
      alert("Error saving conclusion. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="phase-3" className="phase-content">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path>
              <path d="M8 7h4"></path>
              <path d="M8 11h4"></path>
              <path d="M8 15h4"></path>
            </svg>
          </span>
          Write Your Conclusion
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <p className="text-gray-700">
            Based on what you've learned about algorithmic bias and the
            experiments you've conducted, write a thoughtful conclusion about
            your findings and insights. Explain what LLMs are, how they can be
            biased, what experiments you did, what you saw, what you think this
            means, and why it is important.
          </p>

          <div>
            <label
              htmlFor="conclusion"
              className="block text-sm font-medium text-gray-700"
            >
              Your Conclusion
            </label>
            <textarea
              id="conclusion"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 resize-none p-3 border"
              rows={12}
              placeholder="LLMs are...

They can be biased because...

I did an experiment where I tried...

I saw...

I think this means...

It is important because..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveConclusion}
              disabled={isSaving}
              className={`px-4 py-2 ${isSaved ? "bg-green-700" : "bg-green-500"} text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <span className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </span>
                  Saved!
                </>
              ) : (
                <>
                  <span className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  </span>
                  Save Conclusion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConclusionWriter;
