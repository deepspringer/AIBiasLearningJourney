import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ModuleSelection from "@/components/ui/module-selection";

import PhaseNavigation from "@/components/ui/phase-navigation";
import ChatPanel from "@/components/ui/chat-panel";
import PhaseContent from "@/components/ui/phase-content";
import TextReader from "@/components/phase1/text-reader";
import SectionReader from "@/components/phase1/section-reader";
import BiasTestingTool from "@/components/phase2/bias-testing-tool";
import ConclusionWriter from "@/components/phase3/conclusion-writer";
import Survey from "@/components/phase3/survey";
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
  const [showingSurvey, setShowingSurvey] = useState(false);
  const [selectedModule, setSelectedModule] = useState<{
    id: number;
    text: string[];
  } | null>(null);

  const scrollToBottom = () => {
    const chatMessages = document.querySelector(".chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Welcome to LTD Reading. We'll do three things:  
1. LOOK: You'll read and discuss some ideas  
2. THINK: You'll experiment with an interactive tool  
3. DO: You'll write a conclusion, explaining what you found and why it matters.  

To start, read this first paragraph and tell me what you think.`,
    },
  ]);
  const [phase2Messages, setPhase2Messages] = useState<Message[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState(1);
  // Track message counts by section rather than by paragraph
  const [sectionMessageCounts, setSectionMessageCounts] = useState<
    Record<number, number>
  >({});
  const [paragraphEngagement, setParagraphEngagement] = useState<
    Record<number, boolean>
  >({});
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // User state
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load user information from localStorage
    const storedDisplayName = localStorage.getItem("displayName");
    const storedUserId = localStorage.getItem("userId");

    if (storedDisplayName && storedUserId) {
      setDisplayName(storedDisplayName);
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    // When phase changes, add a phase transition message
    if (messages.length > 1) {
      // Don't add on initial load
      let phaseMessage = "";

      switch (currentPhase) {
        case 1:
          phaseMessage =
            "We're now in the 'look' phase. Take your time to read each section, and I'll help you understand the key points.";
          break;
        case 2:
          phaseMessage = `Now we're in the 'think' phase. This is the place to experiment. 
`;
          break;
        case 3:
          phaseMessage =
            "Now we're in the 'do' phase. It's time to write your conclusion based on what you've learned. What were your key takeaways from the reading and experiments? What surprised you?";
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

    // Get conclusion text if in Phase 3
    const conclusionTextArea =
      currentPhase === 3
        ? (document.getElementById("conclusion") as HTMLTextAreaElement)
        : null;
    const conclusionText = conclusionTextArea?.value || "";

    // Auto-save conclusion in Phase 3
    if (currentPhase === 3 && conclusionText) {
      try {
        await fetch("/api/save-conclusion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conclusion: conclusionText }),
        });
      } catch (error) {
        console.error("Error auto-saving conclusion:", error);
        // Continue with message sending even if save fails
      }
    }

    // Modify message content for Phase 3
    const fullMessage =
      currentPhase === 3
        ? `${message}\n\nFor reference, here is my current progress on writing my conclusion:\n\n${conclusionText}`
        : message;

    // Add user message to the state
    setMessages((prev) => [...prev, { role: "user", content: fullMessage }]);
    setIsMessageLoading(true);

    try {
      // Track phase 2 messages separately
      if (currentPhase === 2) {
        setPhase2Messages((prev) => {
          const newMessages = [...prev, { role: "user", content: message }];
          return newMessages;
        });
      }

      // Determine which prompt to use based on the current phase
      let systemPrompt = "";

      switch (currentPhase) {
        case 1:
          console.log(
            "[Phase 1] Building system prompt with module:",
            selectedModule?.name,
          );
          systemPrompt = `${selectedModule?.systemPromptRead || ""}\n\n${ENGAGEMENT_GUIDANCE}`;
          console.log(
            "[Phase 1] Generated system prompt length:",
            systemPrompt.length,
          );
          break;
        case 2:
          // Format text content for the AI system prompt, handling different content types
          const formattedContent = selectedModule?.text?.map(item => {
            if (typeof item === 'string') return item;
            if (item.type === 'text') return item.content;
            if (item.type === 'image') return '[Image content]';
            if (item.type === 'html') return '[Interactive HTML content]';
            return `[Unknown content type: ${item.type}]`;
          }).join("\n") || "";

          systemPrompt = `${selectedModule?.systemPromptExperiment || ""}\n_______________\nFor reference, they just read this text:\n${formattedContent}\n_______________\nAs you talk to them, follow this guidance:\n${ENGAGEMENT_GUIDANCE}`;
          break;
        case 3:
          // Format text content for the AI system prompt, handling different content types
          const conclusionFormattedContent = selectedModule?.text?.map(item => {
            if (typeof item === 'string') return item;
            if (item.type === 'text') return item.content;
            if (item.type === 'image') return '[Image content]';
            if (item.type === 'html') return '[Interactive HTML content]';
            return `[Unknown content type: ${item.type}]`;
          }).join("\n") || "";

          systemPrompt = `${selectedModule?.systemPromptConclude || ""}\n_______________\nFor reference, they just read this text:\n${conclusionFormattedContent}\n_______________\nAs you talk to them, follow this guidance:\n${ENGAGEMENT_GUIDANCE}`;
          break;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt,
          userMessage: fullMessage,
          phase: currentPhase,
          moduleId: selectedModule?.id,
          paragraph: currentPhase === 1 ? currentParagraph : undefined,
          chatHistory: messages.filter((msg) => msg.role !== "system"),
          userId: userId, // Include user ID with all requests
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsMessageLoading(false);

      if (currentPhase === 2) {
        setPhase2Messages((prev) => {
          const newMessages = [...prev, assistantMessage];
          return newMessages;
        });
      }
      // Get the current section for this paragraph
      const sectionIndexes = Array.isArray(selectedModule?.sectionIndexes) ?
        selectedModule?.sectionIndexes : [0];

      const { sectionIndex } = getSectionForParagraph(currentParagraph, sectionIndexes);

      // Increment message count for the section instead of the paragraph
      const newCount = (sectionMessageCounts[sectionIndex] || 0) + 1;
      setSectionMessageCounts((prevCounts) => ({
        ...prevCounts,
        [sectionIndex]: newCount,
      }));

      // Check engagement if we've reached the threshold
      if (currentPhase === 1 && newCount >= 2) {
        const allMessages = [
          ...messages,
          { role: "user", content: fullMessage },
        ];
        // Get only messages for current paragraph by filtering out system messages and assistant messages introducing new paragraphs
        const paragraphMessages = allMessages.filter((m) => {
          if (m.role === "system") return false;
          if (
            m.role === "assistant" &&
            (m.content.includes(`Let's discuss paragraph`) || m.content.includes(`Let's discuss section`))
          )
            return false;
          // Count messages after the last paragraph change message
          const lastParagraphMsg = [...allMessages]
            .reverse()
            .find(
              (msg) =>
                msg.role === "assistant" &&
                msg.content.includes(`Let's discuss paragraph`),
            );
          return (
            !lastParagraphMsg ||
            allMessages.indexOf(m) > allMessages.indexOf(lastParagraphMsg)
          );
        });
        const engagementResult = await checkEngagement(
          selectedModule ? selectedModule.text[currentParagraph - 1] : "",
          paragraphMessages,
          userId || "",
          currentParagraph,
        );
        setParagraphEngagement((prev) => ({
          ...prev,
          [currentParagraph]: engagementResult,
        }));
      }
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
      setIsMessageLoading(false);
    }
  };

  const checkEngagement = async (
    paragraphText: string,
    messages: Message[],
  ) => {
    try {
      const response = await fetch("/api/check-engagement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paragraphText,
          messages: messages.map((m) => m.content).join("\n"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check engagement");
      }

      const data = await response.json();
      return data.engaged;
    } catch (error) {
      console.error("Error checking engagement:", error);
      return true; // Fallback to allow progression if check fails
    }
  };

  // Determine which section a paragraph belongs to
  const getSectionForParagraph = (paragraph: number, sectionIndexes: number[] = [0]) => {
    console.log("SECTION LOOKUP - Finding section for paragraph:", paragraph);
    console.log("SECTION LOOKUP - Using section indexes:", sectionIndexes);

    if (!Array.isArray(sectionIndexes) || sectionIndexes.length === 0) {
      console.log("SECTION LOOKUP - No valid section indexes, defaulting to single section");
      return {
        sectionIndex: 0,
        sectionStart: 0,
        sectionEnd: selectedModule?.text?.length || 0
      };
    }

    // Find which section this paragraph belongs to
    for (let i = sectionIndexes.length - 1; i >= 0; i--) {
      const sectionStart = sectionIndexes[i];
      const sectionEnd = sectionIndexes[i + 1] || (selectedModule?.text?.length || 0);

      console.log(`SECTION LOOKUP - Checking section ${i}: Range [${sectionStart} - ${sectionEnd})`);

      if (paragraph >= sectionStart) {
        console.log(`SECTION LOOKUP - Found section ${i} for paragraph ${paragraph}: Range [${sectionStart} - ${sectionEnd})`);
        return {
          sectionIndex: i,
          sectionStart: sectionStart,
          sectionEnd: sectionEnd
        };
      }
    }

    console.log("SECTION LOOKUP - No matching section found, defaulting to section 0");
    return {
      sectionIndex: 0,
      sectionStart: 0,
      sectionEnd: sectionIndexes[1] || (selectedModule?.text?.length || 0)
    };
  };

  const handleParagraphChange = (newParagraph: number) => {
    console.log("PARAGRAPH CHANGE - Changing from paragraph", currentParagraph, "to", newParagraph);

    // Get current section before the change
    const currentSectionIndexes = Array.isArray(selectedModule?.sectionIndexes) ?
      selectedModule?.sectionIndexes : [0];
    const { sectionIndex: currentSectionIndex } = getSectionForParagraph(currentParagraph, currentSectionIndexes);

    // Update the current paragraph
    setCurrentParagraph(newParagraph);

    // Get new section information
    const sectionIndexes = Array.isArray(selectedModule?.sectionIndexes) ?
      selectedModule?.sectionIndexes : [0];
    const { sectionIndex, sectionStart, sectionEnd } = getSectionForParagraph(newParagraph, sectionIndexes);

    console.log("PARAGRAPH CHANGE - Section change:", {
      previousParagraph: currentParagraph,
      newParagraph,
      previousSectionIndex: currentSectionIndex,
      newSectionIndex: sectionIndex,
      sectionStartParagraph: sectionStart,
      sectionEndParagraph: sectionEnd,
      relativeParagraphPosition: newParagraph - sectionStart,
      totalParagraphsInSection: sectionEnd - sectionStart
    });

    // Add a message about the new section
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Let's discuss section ${sectionIndex + 1} of the content. Read it carefully and let me know what your thoughts and questions are.`,
      },
    ]);

    // Reset message count for the section, not just the paragraph
    setSectionMessageCounts((prevCounts) => {
      const newCounts = {
        ...prevCounts,
        [sectionIndex]: 0, // Reset count for new section
      };
      console.log("PARAGRAPH CHANGE - Reset section message counts:", newCounts);
      return newCounts;
    });
  };

  const handleFloatingActionClick = () => {
    if (currentPhase === 1) {
      if (selectedModule && currentParagraph === selectedModule.text.length) {
        setCurrentPhase(2);
      } else {
        // Get current section index
        const sectionIndexes = Array.isArray(selectedModule?.sectionIndexes) ?
          selectedModule?.sectionIndexes : [0];
        const { sectionIndex: currentSectionIndex } = getSectionForParagraph(currentParagraph, sectionIndexes);

        // Determine next section start paragraph (using 1-indexed paragraphs)
        const nextSectionIndex = currentSectionIndex + 1;
        if (nextSectionIndex < sectionIndexes.length) {
          const nextSectionStart = sectionIndexes[nextSectionIndex] + 1; // +1 to convert to 1-indexed paragraph
          console.log(`FLOATING ACTION - Moving from section ${currentSectionIndex} to section ${nextSectionIndex}, paragraph ${nextSectionStart}`);
          handleParagraphChange(nextSectionStart);
        } else if (currentParagraph < (selectedModule?.text?.length || 0)) {
          // If no more sections, go to the last paragraph
          setCurrentPhase(2); // Move to the next phase if we're at the end of sections
        }
      }
    } else if (currentPhase === 2 && phase2Messages.length >= 10) {
      setCurrentPhase(3);
    }
  };

  if (!selectedModule) {
    return (
      <ModuleSelection
        onModuleSelect={(moduleId) => {
          setSelectedModule(moduleId);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-primary">
              LTD Reading Platform
            </h1>

            <div className="flex items-center space-x-6">
              <PhaseNavigation
                currentPhase={currentPhase}
                onPhaseChange={setCurrentPhase}
                isPhase2Unlocked={true}
                isPhase3Unlocked={true}
              />

              {/* User info and logout */}
              <div className="flex items-center space-x-3">
                {displayName && (
                  <div className="text-sm font-medium">
                    Welcome, {displayName}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear user data and redirect to login
                    localStorage.removeItem("userId");
                    localStorage.removeItem("displayName");
                    setUserId(null);
                    setDisplayName(null);
                    toast({
                      title: "Logged out",
                      description: "You've been logged out successfully",
                    });
                    setLocation("/");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
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
            isLoading={isMessageLoading}
            currentPhase={currentPhase}
            isEngaged={paragraphEngagement[currentParagraph] || false}
            messageCount={
              (() => {
                // Calculate section index for current paragraph
                if (!selectedModule) return 0;

                const sectionIndexes = Array.isArray(selectedModule.sectionIndexes) ?
                  selectedModule.sectionIndexes : [0];
                const { sectionIndex } = getSectionForParagraph(currentParagraph, sectionIndexes);

                return sectionMessageCounts[sectionIndex] || 0;
              })()
            }
            onFloatingActionClick={handleFloatingActionClick}
            isLastParagraph={
              selectedModule
                ? currentParagraph === selectedModule.text.length
                : false
            }
            onFinish={() => {
              setShowingSurvey(true);
            }}
          />

          {/* Content Panel */}
          <PhaseContent currentPhase={currentPhase}>
            {currentPhase === 1 && selectedModule && (
              <SectionReader
                currentParagraph={currentParagraph}
                onParagraphChange={handleParagraphChange}
                paragraphMessageCounts={{}} // Keep for backward compatibility
                sectionMessageCounts={sectionMessageCounts}
                moduleText={selectedModule.text}
                sectionIndexes={Array.isArray(selectedModule.sectionIndexes) ? selectedModule.sectionIndexes : [0]}
              />
            )}
            {(currentPhase === 2 || (currentPhase === 3 && !showingSurvey)) && (
              <div
                data-selected-module
                data-experiment-html={selectedModule?.experimentHtml || ""}
              >
                {console.log(
                  "[AlgorithmicBiasApp] selectedModule:",
                  selectedModule,
                )}
                {console.log(
                  "[AlgorithmicBiasApp] experimentHtml being passed:",
                  selectedModule?.experimentHtml || "",
                )}
                <BiasTestingTool
                  onSendMessage={handleSendMessage}
                  experimentHtml={selectedModule?.experimentHtml || ""}
                  key="bias-tool" // Prevent remounting
                />
              </div>
            )}
            {currentPhase === 3 && (
              <div className="space-y-6">
                {!showingSurvey ? (
                  <>
                    <ConclusionWriter
                      concludeText={selectedModule?.concludeText}
                      onShowSurvey={() => {
                        const message = {
                          role: "assistant",
                          content:
                            "Thank you for saving your conclusion. You can continue working on it, or click the button below to finish and take an optional feedback survey.",
                        };
                        setMessages((prev) => [...prev, message]);
                        scrollToBottom();
                      }}
                    />
                  </>
                ) : (
                  <Survey onPhaseChange={setCurrentPhase} />
                )}
              </div>
            )}
          </PhaseContent>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} LTD Reading Platform
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
