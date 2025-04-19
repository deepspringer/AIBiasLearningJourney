import { ALGORITHMIC_BIAS_TEXT } from "@/constants/text-content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TextReaderProps {
  currentParagraph: number;
  onParagraphChange: (paragraph: number) => void;
  paragraphMessageCounts: Record<number, number>;
}

const TextReader = ({ currentParagraph, onParagraphChange, paragraphMessageCounts }: TextReaderProps) => {
  const totalParagraphs = ALGORITHMIC_BIAS_TEXT.length;

  const handlePrevious = () => {
    if (currentParagraph > 1) {
      onParagraphChange(currentParagraph - 1);
    }
  };

  const handleNext = () => {
    if (currentParagraph < totalParagraphs) {
      onParagraphChange(currentParagraph + 1);
    }
  };

  return (
    <div id="phase-1" className="phase-content">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
          </span>
          Understanding Algorithmic Bias
        </h2>
      </div>
      
      <div className="p-6">
        {/* Paragraph Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentParagraph === 1}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </span>
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            Paragraph {currentParagraph} of {totalParagraphs}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentParagraph === totalParagraphs || (paragraphMessageCounts[currentParagraph] || 0) === 0}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <span className="ml-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </span>
          </button>
        </div>
        
        {/* Text Content */}
        <div className="prose max-w-none h-[calc(100vh-300px)] overflow-y-auto">
          {ALGORITHMIC_BIAS_TEXT.map((paragraph, index) => (
            <div
              key={index}
              className={`paragraph mb-4 ${
                index + 1 === currentParagraph
                  ? "active bg-blue-50 p-4 rounded-md border-l-4 border-primary"
                  : "hidden"
              }`}
            >
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {paragraph}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextReader;
