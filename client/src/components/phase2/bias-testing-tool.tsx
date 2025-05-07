import { useState, useMemo } from "react";
import BiasTestGraph from "./bias-test-graph";

interface BiasTestResult {
  word: string;
  message: string;
  topLogprobs: Array<{ token: string; logprob: number }>;
}

interface BiasTestingToolProps {
  onSendMessage: (message: string) => void;
}

const BiasTestingTool = ({ onSendMessage }: BiasTestingToolProps) => {
  const [experimentHtml, setExperimentHtml] = useState("");

  useEffect(() => {
    // Create an iframe to contain the standalone tool
    const container = document.createElement('div');
    container.innerHTML = experimentHtml;
    
    // Get the selected module's experiment HTML from the parent component
    const module = document.querySelector('[data-selected-module]');
    if (module) {
      setExperimentHtml(module.getAttribute('data-experiment-html') || '');
    }
  }, []);

  const hasValidTemplate = template.includes("*");
  const substitutionList = useMemo(
    () =>
      substitutions
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s),
    [substitutions],
  );

  const previewSentences = useMemo(
    () =>
      substitutionList.map(
        (word) => template.replace("*", word) + " __________",
      ),
    [template, substitutionList],
  );

  const formatResultsAsMessage = (
    template: string,
    results: BiasTestResult[],
  ) => {
    let message = `Bias Test Results for template: "${template}"\n\n`;
    results.forEach((result) => {
      message += `For "${result.word}":\n`;
      message += `Complete sentence: "${template.replace("*", result.word)} ${result.message}"\n`;
      message += "Top next tokens:\n";
      result.topLogprobs.forEach((lp) => {
        message += `- ${lp.token.trim() || "(space)"}: ${(Math.exp(lp.logprob) * 100).toFixed(3)}%\n`;
      });
      message += "\n";
    });
    return message;
  };

  const handleRunTest = async () => {
    if (!hasValidTemplate) {
      alert("Your template must include an asterisk (*) as a placeholder.");
      return;
    }

    if (substitutionList.length === 0) {
      alert("Please provide at least one substitution word.");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/bias-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          substitutions: substitutionList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get test results");
      }

      const data = await response.json();
      setResults(data.results);
      const message = formatResultsAsMessage(template, data.results);
      onSendMessage(message);
    } catch (error) {
      console.error("Error running bias test:", error);
      alert("Error running test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="phase-2" className="phase-content">
      <>
        <div dangerouslySetInnerHTML={{ __html: experimentHtml }} />
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
              <path d="M12 11.9c.64 0 1.24-.32 1.6-.86A1.86 1.86 0 0 0 14 9.86c0-.52-.2-1.01-.56-1.38A1.8 1.8 0 0 0 12 8.06c-.63 0-1.23.33-1.59.86A1.86 1.86 0 0 0 10 9.86c0 .52.2 1.01.56 1.38 .36.37.85.59 1.38.59"></path>
              <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path>
              <path d="M9 17c0-3 1-5 3-5s3 2 3 5"></path>
              <path d="M9 10.2V10"></path>
              <path d="M15 10.2V10"></path>
            </svg>
          </span>
          LLM Bias Testing Tool
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sentence Template (use{" "}
              <code className="bg-gray-100 px-1 rounded">*</code> as
              placeholder)
            </label>
            <input
              type="text"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3 border"
            />
            <p className="mt-1 text-sm text-gray-500">
              Example: "The * person was known to be"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Demographic Labels (one per line)
            </label>
            <textarea
              value={substitutions}
              onChange={(e) => setSubstitutions(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3 border font-mono"
            />
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
            <div className="space-y-1">
              {hasValidTemplate && substitutionList.length > 0 ? (
                previewSentences.map((sentence, index) => (
                  <div key={index} className="text-gray-600 font-mono text-sm">
                    {sentence}
                  </div>
                ))
              ) : (
                <div className="text-red-500 font-medium text-sm">
                  {!hasValidTemplate &&
                    "Make sure you have an asterisk in your template sentence."}
                  {hasValidTemplate &&
                    substitutionList.length === 0 &&
                    "Make sure you include some choices in the Demographic Labels area"}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handleRunTest}
              disabled={isLoading || !hasValidTemplate}
              className={`w-full md:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 flex items-center justify-center ${
                isLoading || !hasValidTemplate
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
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
                  Processing...
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
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </span>
                  Run Test
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div className="mt-6 space-y-6">
            <BiasTestGraph results={results} />
            {isLoading && <p className="text-gray-500">Running tests...</p>}
            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="result border rounded-lg overflow-hidden shadow-sm"
                >
                  <h3 className="text-md font-semibold bg-gray-50 p-3 border-b">
                    {result.word}
                  </h3>
                  <div className="p-4">
                    <div className="mb-2">
                      <strong>Completion:</strong> "
                      {template.replace("*", result.word)} {result.message}"
                    </div>
                    <div>
                      <strong>Top Next Tokens:</strong>
                      <pre className="bg-gray-50 p-3 rounded mt-2 font-mono text-sm overflow-x-auto">
                        {result.topLogprobs
                          .map(
                            (lp) =>
                              `${lp.token.trim() || "(space)"}: ${(Math.exp(lp.logprob) * 100).toFixed(3)}%`,
                          )
                          .join("\n")}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <BiasTestGraph results={results} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasTestingTool;
