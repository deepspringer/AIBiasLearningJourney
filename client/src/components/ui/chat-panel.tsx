import { useState, useRef, useEffect } from "react";
import { type Message } from "@/pages/AlgorithmicBiasApp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  currentPhase: number;
  isEngaged: boolean;
  onFloatingActionClick?: () => void;
  isLastParagraph?: boolean;
  messageCount?: number;
  onConclusionSave?: () => void; // Added for conclusion saving
}

const ChatPanel = ({ messages, onSendMessage, isLoading, onFloatingActionClick, isLastParagraph, currentPhase, isEngaged, messageCount = 0, onConclusionSave }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (onConclusionSave) { // Only scroll if onConclusionSave is provided.
        onConclusionSave()
        .then(() => scrollToBottom());
    } else {
        scrollToBottom();
    }
  }, [messages, onConclusionSave]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="w-full lg:w-5/12 flex flex-col bg-white rounded-lg shadow-sm order-2 lg:order-1">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </span>
          Learning Assistant
        </h2>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatMessagesRef}
        className="flex-grow p-4 space-y-4 overflow-y-auto h-[calc(100vh-300px)]"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role !== "user" && (
              <div className="flex-shrink-0 mr-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8"></path>
                      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                      <path d="m6 20 4-4h4l4 4"></path>
                    </svg>
                  </span>
                </div>
              </div>
            )}

            <div
              className={`${
                message.role === "user"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800"
              } rounded-lg p-3 max-w-[85%]`}
            >
              {message.role === "user" ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 ml-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="m6 20 4-4h4l4 4"></path>
                  </svg>
                </span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
              <div className="flex space-x-1">
                <div className="typing-dot bg-gray-500 h-2 w-2 rounded-full animate-pulse"></div>
                <div className="typing-dot bg-gray-500 h-2 w-2 rounded-full animate-pulse delay-150"></div>
                <div className="typing-dot bg-gray-500 h-2 w-2 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 3 && messages.some(m => m.content.includes("take an optional feedback survey")) && (
          <button
            onClick={() => onFinish?.()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
          >
            <span className="mr-2">Finish</span>
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
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Action Button */}
      <div className="sticky bottom-20 flex justify-center p-4">
        {onFloatingActionClick && (messageCount >= 6 || isEngaged) && (
          <button
            onClick={onFloatingActionClick}
            className="bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            {currentPhase === 1 
              ? (isLastParagraph ? "Move onto Experimenting" : "Next Paragraph")
              : "Move onto your Conclusion"
            }
          </button>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-start">
          <textarea
            className="flex-grow resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Type your message here..."
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          ></textarea>
          <button
            type="submit"
            className={`ml-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;