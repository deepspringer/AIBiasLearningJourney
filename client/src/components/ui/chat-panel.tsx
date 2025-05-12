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
  onFinish?: () => void; // Added for handling finish action
}

const ChatPanel = ({ messages, onSendMessage, isLoading, onFloatingActionClick, isLastParagraph, currentPhase, isEngaged, messageCount = 0, onConclusionSave, onFinish }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      // Create a toast message to notify the user
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Recording... (max 30 seconds)';
      document.body.appendChild(toast);

      // Set a maximum recording time of 30 seconds
      const MAX_RECORDING_TIME = 30000; // 30 seconds
      let recordingTimeout: NodeJS.Timeout | null = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Use a more efficient codec if available
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // 128kbps for smaller file size
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up auto-stop after MAX_RECORDING_TIME
      recordingTimeout = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          document.body.removeChild(toast);
          stopRecording();
        }
      }, MAX_RECORDING_TIME);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        // Clear the timeout if it exists
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
        }

        // Remove the toast
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }

        try {
          // Create a blob from the audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          console.log(`Audio size: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB`);

          // Convert to base64 for sending to API
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result as string;
              const base64Data = base64Audio.split(',')[1]; // Remove the data URL prefix

              // Send to Whisper API
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audio: base64Data }),
              });

              if (!response.ok) {
                throw new Error('Failed to transcribe audio');
              }

              const data = await response.json();

              // Append transcript to input
              setInput(prev => {
                const separator = prev.trim() ? ' ' : '';
                return prev + separator + data.text;
              });
            } catch (error) {
              console.error('Error transcribing audio:', error);

              // Show error message to user
              const errorToast = document.createElement('div');
              errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
              errorToast.textContent = 'Failed to transcribe audio. Please try again with a shorter recording.';
              document.body.appendChild(errorToast);

              // Remove the error toast after 3 seconds
              setTimeout(() => {
                if (document.body.contains(errorToast)) {
                  document.body.removeChild(errorToast);
                }
              }, 3000);
            } finally {
              setIsTranscribing(false);
            }
          };
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsTranscribing(false);
        }

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Instead of collecting data continuously, get data every second
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);

      // Show error message to user
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorToast.textContent = 'Could not access microphone. Please check permissions.';
      document.body.appendChild(errorToast);

      // Remove the error toast after 3 seconds
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
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
            onClick={() => {
              console.log("[ChatPanel] Finish button clicked");
              onFinish?.();
            }}
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
        {onFloatingActionClick && (
          (currentPhase === 1 && (messageCount >= 6 || isEngaged)) || 
          (currentPhase === 2 && messageCount >= 10)
        ) && (
          <button
            onClick={onFloatingActionClick}
            className="bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            {currentPhase === 1
              ? (isLastParagraph ? "Move onto Experimenting" : "Next Section")
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
            disabled={isLoading || isRecording || isTranscribing}
          ></textarea>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
            className={`ml-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isRecording
                ? "bg-red-500 text-white animate-pulse"
                : isTranscribing
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
              ${(isLoading || isTranscribing) ? "opacity-50 cursor-not-allowed" : ""}
            `}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : isTranscribing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                <path d="M9 12h6"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className={`ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || isRecording || isTranscribing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading || isRecording || isTranscribing}
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