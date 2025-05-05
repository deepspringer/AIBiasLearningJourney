import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ALGORITHMIC_BIAS_TEXT } from "@/constants/text-content";
import PhaseNavigation from "@/components/ui/phase-navigation";
import ChatPanel from "@/components/ui/chat-panel";
import PhaseContent from "@/components/ui/phase-content";
import TextReader from "@/components/phase1/text-reader";
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
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  const scrollToBottom = () => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi. I'm here to teach you about bias in Artificial Intelligence. We'll do three things:  
1. LOOK: You'll read and discuss some ideas  
2. THINK: You'll experiment with a tool to see how AI responds differently when it's talking about different kinds of people  
3. DO: You'll write a conclusion, explaining what you found and why it matters.  

To start, read this first paragraph and tell me what you think.`,
    },
  ]);
  const [phase2Messages, setPhase2Messages] = useState<Message[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState(1);
  const [paragraphMessageCounts, setParagraphMessageCounts] = useState<
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
            "We're now in the 'look' phase. Let's explore the concept of algorithmic bias paragraph by paragraph. Take your time to read each section, and I'll help you understand the key points.";
          break;
        case 2:
          phaseMessage = `Now we're in the 'think' phase. This is the place to experiment. Try running the example that is set up. It tells you how the newest version of ChatGPT will complete a sentence about different groups of students.  

Then you can change the sentence and the list of groups. In your sentence, leave an asterisk (*) to show where the different group names should go in. And leave your sentence incomplete to find out how the AI will finish it.   

Here are some ideas for sentences:   
Hiring: "As the hiring committee, on a scale of one to ten, we give the * candidate a score of: "  
College Admissions: "We, the college admissions committee, have decided that the * student should be "  
Fictional Stories: "Once upon a time there was a person named * who wanted to be a "  

Here are some ideas for groups:  
The names used in the Silicon Ceiling paper (Darius Mosby, Katie Burns, etc. You can ask me for more)  
The religion and caste groups used in the IndiBias paper (Muslim, Hindu, Brahmin, Vaishya, Kshatriya, Shudra, High Caste, Low Caste)  
Any other groups you can think of  
`;
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
          console.log(
            "[Debug] Phase 2 messages after user message:",
            newMessages.length,
          );
          return newMessages;
        });
      }

      // Determine which prompt to use based on the current phase
      let systemPrompt = "";

      switch (currentPhase) {
        case 1:
          systemPrompt = `You are helping to guide a 9th grade student through a text about algorithmic bias paragraph-by-paragraph. Start with open ended questions (e.g. "What do you think this is saying", "Have you heard of this idea before"), but if they struggle, provide more specific comprehension questions. (e.g. "Does the reading say that LLMs are always predictable or that they include some randomness?"). You can also ask them to speculate about the ideas. (e.g. "What do you think would happen if LLMs were always predictable?", "What kinds of sources on the internet might 'teach' and LLM to say biased things?")

          Do not repeat the text of the paragraph. They have it displayed above. 

          Only ask one question at a time.


${ENGAGEMENT_GUIDANCE}`;
          break;
        case 2:
          systemPrompt = `You are guiding a 9th grade student through experimenting with an online tool. In the online tool, they have two input boxes. In one they put an imcomplete template sentence, using an asterisk * as a placeholder. The sentence should be incomplete because the goal is to see how an LLM would finish the sentence differently for different demographic variables. In the other input area they put a list of demographic label--each on its own line. When they click "Run", the demographic labels are inserted in to the template sentence. Then they see the predicted next token. For example, if they put "The * student was known to be" as the template and "Asian\nWhite\nBlack\nLatino\nMale" as the demographic labels, they might see that the LLM predicts "dedicated" for Asian, "diverse" for White, and "talented" for Black and Latino. They will also see the top 20 most likely next tokens. These are likely to be partial words such as "ded", "div", "tal", "int", etc. They will also see the probability of each token. If they want to know what a token means, they can add it to the end of the template sentence and click run again. For instance, if they see "int" as a possible token, they can put "The * student was known to be int" as the template and click run again, which might result in a completion of "eresting" (interesting), "elligent" (intelligent), "roverted" (introverted) or something else.
          _______________
          You should help them formulate new sentences and demographic labels to check, then help them interpret their outputs. You can suggest general sentences (e.g. "The * person is "), You can suggest ones related to hiring or college admissions (e.g. We the hiring committe have examined the qualifications of *, and on a scale of 1-5 have awarded them: "). You can suggest that they use demographically coded names such as the ones used in the Silicon Ceiling paper. And you can remind them of the names used there. You can suggest demographic labels related to an international context as in the IndiBias paper. (e.g. their demographic labels could be Brahmin, Vaishya, Kshatriya, and Shudra). You can suggest they try making fictional stories (e.g. "Once upon a time there was a * who wanted to be a ")
          _______________
          For reference, they just read this text: 
          ${ALGORITHMIC_BIAS_TEXT}
          _______________
          As you talk to them, follow this guidance:
          ${ENGAGEMENT_GUIDANCE}`;
          break;
        case 3:
          systemPrompt = `You are helping a 9th grade student to write a conclusion based on the work they've done in the previous two phases. Do not write any sentences for their conclusion. They must write all the text. I repeat: Do NOT write any sentences for their conclusion. They must write all the text. Your bias should be toward asking questions rather than giving advice. Only ever ask one question at a time. 

          The students should write a conclusion that answers these questions: 
          What did you learn about algorithmic bias and AI?
          What experiments did you do with the bias tool?
          What differences did you see in the AI's responses to different demographic labels?
          Why do you think these differences exist?
          Why do you think this matters? 

           As they write, they can continue formulating research questions, test cases and results.

          _______________
          For reference, they just read this text: 
          ${ALGORITHMIC_BIAS_TEXT}
          _______________
          As you talk to them, follow this guidance:
          ${ENGAGEMENT_GUIDANCE}`;
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
          console.log(
            "[Debug] Phase 2 messages after assistant response:",
            newMessages.length,
          );
          return newMessages;
        });
      }
      const newCount = (paragraphMessageCounts[currentParagraph] || 0) + 1;
      setParagraphMessageCounts((prevCounts) => ({
        ...prevCounts,
        [currentParagraph]: newCount,
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
            m.content.includes(`Let's discuss paragraph`)
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
          ALGORITHMIC_BIAS_TEXT[currentParagraph - 1],
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
      console.log("Engagement data:", data);
      return data.engaged;
    } catch (error) {
      console.error("Error checking engagement:", error);
      return true; // Fallback to allow progression if check fails
    }
  };

  const handleParagraphChange = (newParagraph: number) => {
    setCurrentParagraph(newParagraph);
    // Add a message about the new paragraph
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Here is section ${newParagraph}.   Read it and let me know what your thoughts and questions are.`,
      },
    ]);
    setParagraphMessageCounts((prevCounts) => ({
      ...prevCounts,
      [newParagraph]: 0, //Reset count for new paragraph
    }));
  };

  const handleFloatingActionClick = () => {
    if (currentPhase === 1) {
      if (currentParagraph === ALGORITHMIC_BIAS_TEXT.length) {
        setCurrentPhase(2);
      } else {
        handleParagraphChange(currentParagraph + 1);
      }
    } else if (currentPhase === 2 && phase2Messages.length >= 10) {
      setCurrentPhase(3);
    }
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

            <div className="flex items-center space-x-6">
              <PhaseNavigation
                currentPhase={currentPhase}
                onPhaseChange={setCurrentPhase}
                isPhase2Unlocked={
                  currentPhase === 2 ||
                  (currentPhase === 1 &&
                    currentParagraph === ALGORITHMIC_BIAS_TEXT.length &&
                    (paragraphMessageCounts[currentParagraph] || 0) >= 2)
                }
                isPhase3Unlocked={currentPhase === 3 || phase2Messages.length >= 10}
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
            messageCount={paragraphMessageCounts[currentParagraph] || 0}
            onFloatingActionClick={handleFloatingActionClick}
            isLastParagraph={currentParagraph === ALGORITHMIC_BIAS_TEXT.length}
            onFinish={() => {
              console.log("[AlgorithmicBiasApp] Setting showingSurvey to true");
              setShowingSurvey(true);
              console.log("[AlgorithmicBiasApp] Current phase:", currentPhase);
            }}
          />

          {/* Content Panel */}
          <PhaseContent currentPhase={currentPhase}>
            {currentPhase === 1 && (
              <TextReader
                currentParagraph={currentParagraph}
                onParagraphChange={handleParagraphChange}
                paragraphMessageCounts={paragraphMessageCounts} // Pass message counts to TextReader
              />
            )}
            {(currentPhase === 2 || (currentPhase === 3 && !showingSurvey)) && (
              <BiasTestingTool 
                onSendMessage={handleSendMessage}
                key="bias-tool" // Prevent remounting
              />
            )}
            {currentPhase === 3 && (
              <div className="space-y-6">
                {!showingSurvey ? (
                  <>
                    <ConclusionWriter
                      onShowSurvey={() => {
                        const message = {
                          role: "assistant",
                          content: "Thank you for saving your conclusion. You can continue working on it, or click the button below to finish and take an optional feedback survey.",
                        };
                        setMessages(prev => [...prev, message]);
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