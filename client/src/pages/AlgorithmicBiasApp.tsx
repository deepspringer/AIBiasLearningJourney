import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import PhaseNavigation from "@/components/ui/phase-navigation";
import ChatPanel from "@/components/ui/chat-panel";
import PhaseContent from "@/components/ui/phase-content";
import TextReader from "@/components/phase1/text-reader";
import BiasTestingTool from "@/components/phase2/bias-testing-tool";
import ConclusionWriter from "@/components/phase3/conclusion-writer";
import { ENGAGEMENT_GUIDANCE } from "@/constants/prompts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Phase = 1 | 2 | 3;
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const AlgorithmicBiasApp = () => {
  const [currentPhase, setCurrentPhase] = useState<Phase>(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the Algorithmic Bias Learning Platform! I'm here to guide you through understanding algorithmic bias. Let's start by exploring some key concepts. Ready to begin?",
    },
  ]);
  const [currentParagraph, setCurrentParagraph] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // When phase changes, add a phase transition message
    if (messages.length > 1) {
      // Don't add on initial load
      let phaseMessage = "";

      switch (currentPhase) {
        case 1:
          phaseMessage =
            "We're now in the 'look' phase. Let's explore the concept of algorithmic bias paragraph by paragraph. Take your time to read each section, and I'll help you understand the key points.";
          break;
        case 2:
          phaseMessage =
            "Now we're in the 'think' phase. This is the place to experiment. You can use the tool to create template sentences and see how language models respond differently to various demographic terms. Try creating some templates and we'll analyze the results together.";
          break;
        case 3:
          phaseMessage =
            "Now we're in the 'do' phase. It's time to write your conclusion based on what you've learned. What were your key takeaways from the reading and experiments? What surprised you about algorithmic bias?";
          break;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: phaseMessage },
      ]);
    }
  }, [currentPhase]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to the state
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      // Determine which prompt to use based on the current phase
      let systemPrompt = "";

      switch (currentPhase) {
        case 1:
          systemPrompt = `You are helping to guide a student through a text about algorithmic bias paragraph by paragraph. ${ENGAGEMENT_GUIDANCE}`;
          break;
        case 2:
          systemPrompt = `You are guiding a student through experimenting with an online tool. In the online tool, they have two input boxes. In one they put a template sentence, in the other they put a comma-separated list of demographic labels. Then they see the predicted next token. You should help them formulate new sentences and demographic labels to check, then help them interpret their outputs. ${ENGAGEMENT_GUIDANCE}`;
          break;
        case 3:
          systemPrompt = `You are helping a student to write a conclusion based on the work they've done in the previous two phases. Do not write any sentences for their conclusion. They must write all the text. I repeat: Do NOT write any sentences for their conclusion. They must write all the text. Your bias should be toward asking questions rather than giving advice. Only ever ask one question at a time. ${ENGAGEMENT_GUIDANCE}`;
          break;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
          userMessage: message,
          phase: currentPhase,
          paragraph: currentPhase === 1 ? currentParagraph : undefined,
          chatHistory: messages.filter((msg) => msg.role !== "system"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your message. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParagraphChange = (newParagraph: number) => {
    setCurrentParagraph(newParagraph);
    // Add a message about the new paragraph
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Let's discuss paragraph ${newParagraph}. What do you think is the main point here? How does it relate to what you already know about algorithmic bias?`,
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-primary">
              Algorithmic Bias Learning Platform
            </h1>
            <PhaseNavigation
              currentPhase={currentPhase}
              onPhaseChange={setCurrentPhase}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row">
        <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 gap-6">
          {/* Chat Panel */}
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />

          {/* Content Panel */}
          <PhaseContent currentPhase={currentPhase}>
            {currentPhase === 1 && (
              <TextReader
                currentParagraph={currentParagraph}
                onParagraphChange={handleParagraphChange}
              />
            )}
            {currentPhase === 2 && <BiasTestingTool />}
            {currentPhase === 3 && <ConclusionWriter />}
          </PhaseContent>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Algorithmic Bias Learning Platform
            </p>
            <div>
              <button className="text-primary hover:text-blue-600 flex items-center text-sm">
                <span className="mr-1 text-sm">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </span>
                Help
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlgorithmicBiasApp;
