import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContentItem } from "@shared/schema";

interface SectionReaderProps {
  currentParagraph: number;
  onParagraphChange: (paragraph: number) => void;
  // Use section message counts instead of paragraph message counts
  paragraphMessageCounts: Record<number, number>; // Keep for backward compatibility
  sectionMessageCounts?: Record<number, number>; // New property
  moduleText: ContentItem[] | string[]; // Support both new and old formats
  sectionIndexes?: number[]; // Optional section indexes
}

const SectionReader = ({
  currentParagraph,
  onParagraphChange,
  paragraphMessageCounts,
  sectionMessageCounts = {},
  moduleText,
  sectionIndexes = [0],
}: SectionReaderProps) => {
  const totalParagraphs = moduleText.length;

  // Ensure section indexes is an array and has at least [0]
  let safeIndexes = Array.isArray(sectionIndexes) && sectionIndexes.length > 0
    ? [...sectionIndexes] // Create a copy to avoid mutation issues
    : [0];

  // Always make sure 0 is included
  if (!safeIndexes.includes(0)) {
    safeIndexes.unshift(0);
    safeIndexes.sort((a, b) => a - b);
  }

  console.log("SectionReader received section indexes:", sectionIndexes);
  console.log("Using section indexes:", safeIndexes);

  // Validate indexes are within bounds
  const validatedIndexes = safeIndexes.filter(idx => idx >= 0 && idx < moduleText.length);

  // Make sure we always have at least index 0
  if (!validatedIndexes.includes(0)) {
    validatedIndexes.unshift(0);
  }

  // Sort indexes to ensure proper order
  validatedIndexes.sort((a, b) => a - b);

  console.log("SectionReader using validated indexes:", validatedIndexes);

  // Group content items by sections
  const sections = validatedIndexes.map((startIndex, i) => {
    const endIndex = validatedIndexes[i + 1] || moduleText.length;
    return moduleText.slice(startIndex, endIndex);
  });

  // Determine current section based on paragraph
  const getCurrentSectionIndex = () => {
    console.log("Finding section for paragraph:", currentParagraph);

    // Adjust for 1-indexed paragraph to match 0-indexed section indexes
    // When currentParagraph is 1, we want section 0, when it's 2, we match section indexes starting at 1, etc.
    const adjustedParagraph = currentParagraph - 1;

    console.log("Adjusted paragraph index (0-based):", adjustedParagraph);

    for (let i = 0; i < validatedIndexes.length; i++) {
      const sectionStart = validatedIndexes[i];
      const sectionEnd = validatedIndexes[i + 1] || moduleText.length;

      console.log(`Checking section ${i}: Range [${sectionStart} - ${sectionEnd})`);

      // Check using adjusted paragraph index to match 0-indexed section boundaries
      if (adjustedParagraph >= sectionStart && (i === validatedIndexes.length - 1 || adjustedParagraph < sectionEnd)) {
        console.log(`Found section ${i} for paragraph ${currentParagraph} (adjusted: ${adjustedParagraph}): Range [${sectionStart} - ${sectionEnd})`);
        return i;
      }
    }
    console.log("No matching section found, defaulting to section 0");
    return 0;
  };

  const currentSectionIndex = getCurrentSectionIndex();
  const currentSection = sections[currentSectionIndex] || [];
  const sectionStartIndex = validatedIndexes[currentSectionIndex] || 0;

  // Log detailed information about the current section
  console.log("CURRENT SECTION INFO:", {
    currentParagraph,
    currentSectionIndex,
    sectionStartParagraph: sectionStartIndex,
    sectionEndParagraph: validatedIndexes[currentSectionIndex + 1] || moduleText.length,
    relativeParagraphPosition: currentParagraph - sectionStartIndex,
    paragraphsInSection: currentSection.length,
    contentTypes: currentSection.map(item => typeof item === 'string' ? 'text' : item.type)
  });

  const handlePrevious = () => {
    console.log("NAVIGATION - BEFORE Previous:", {
      currentParagraph,
      currentSectionIndex,
      sectionStart: validatedIndexes[currentSectionIndex],
      sectionEnd: validatedIndexes[currentSectionIndex + 1] || moduleText.length,
      relativeParagraphInSection: currentParagraph - validatedIndexes[currentSectionIndex] - 1, // Adjust for 1-indexed paragraphs
      totalParagraphsInSection: (validatedIndexes[currentSectionIndex + 1] || moduleText.length) - validatedIndexes[currentSectionIndex],
      messageCount: sectionMessageCounts[currentSectionIndex] !== undefined
        ? sectionMessageCounts[currentSectionIndex]
        : paragraphMessageCounts[currentParagraph] || 0
    });

    // We only move between sections, not paragraphs
    if (currentSectionIndex > 0) {
      // Go to the previous section's start
      // Add 1 to convert from 0-indexed section start to 1-indexed paragraph
      const previousSectionStartIndex = validatedIndexes[currentSectionIndex - 1] + 1;
      console.log("NAVIGATION - Decision: Moving to previous section start");
      onParagraphChange(previousSectionStartIndex);

      console.log("NAVIGATION - AFTER Previous:", {
        newParagraph: previousSectionStartIndex,
        newSectionIndex: currentSectionIndex - 1,
        newSectionStart: validatedIndexes[currentSectionIndex - 1],
        newSectionEnd: validatedIndexes[currentSectionIndex] || moduleText.length,
        adjustedForDisplay: `Section starts at index ${validatedIndexes[currentSectionIndex - 1]} but paragraph is ${previousSectionStartIndex}`
      });
    } else {
      console.log("NAVIGATION - Decision: Already at first section, no navigation possible");
    }
    // We've removed paragraph-by-paragraph navigation within sections
    // Now we only navigate between sections
  };

  const handleNext = () => {
    // Check if we have enough messages for this section
    // Use section message counts if available, otherwise fall back to paragraph counts
    const messageCount = sectionMessageCounts[currentSectionIndex] !== undefined
      ? sectionMessageCounts[currentSectionIndex]
      : paragraphMessageCounts[currentParagraph] || 0;

    console.log("NAVIGATION - BEFORE Next:", {
      currentParagraph,
      currentSectionIndex,
      sectionStart: validatedIndexes[currentSectionIndex],
      sectionEnd: validatedIndexes[currentSectionIndex + 1] || moduleText.length,
      relativeParagraphInSection: currentParagraph - validatedIndexes[currentSectionIndex] - 1, // Adjust for 1-indexed paragraphs
      totalParagraphsInSection: (validatedIndexes[currentSectionIndex + 1] || moduleText.length) - validatedIndexes[currentSectionIndex],
      messageCount,
      totalParagraphs,
      hasEnoughMessages: messageCount > 0
    });

    // Only proceed if message requirement is met (at least 1 exchange)
    if (messageCount === 0) {
      console.log("NAVIGATION - Decision: Cannot proceed without messages");
      return; // Cannot proceed without messages
    }

    // Find the next section index
    const nextSectionIndex = currentSectionIndex + 1;

    if (nextSectionIndex < validatedIndexes.length) {
      // Always move to the start of the next section
      // Add 1 to convert from 0-indexed section start to 1-indexed paragraph
      const nextSectionStartIndex = validatedIndexes[nextSectionIndex] + 1;
      console.log("NAVIGATION - Decision: Moving to next section start");
      onParagraphChange(nextSectionStartIndex);

      console.log("NAVIGATION - AFTER Next:", {
        newParagraph: nextSectionStartIndex,
        newSectionIndex: nextSectionIndex,
        newSectionStart: validatedIndexes[nextSectionIndex],
        newSectionEnd: validatedIndexes[nextSectionIndex + 1] || moduleText.length,
        relativeParagraphInSection: 1, // First paragraph in the section (1-indexed)
        adjustedForDisplay: `Section starts at index ${validatedIndexes[nextSectionIndex]} but paragraph is ${nextSectionStartIndex}`
      });
    } else {
      // If we're at the last section, we don't navigate further
      console.log("NAVIGATION - Decision: Already at last section, no further navigation possible");
    }
    // We're removing the paragraph-by-paragraph navigation within a section
    // Now we only navigate between sections
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
          Look: Read and Discuss
        </h2>
      </div>

      <div className="p-6">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </span>
            {currentSectionIndex > 0 ? "Previous Section" : "Back"}
          </button>

          <span className="text-sm text-gray-500">
            Section {currentSectionIndex + 1} of {sections.length}
          </span>

          <button
            onClick={handleNext}
            disabled={
              currentSectionIndex === validatedIndexes.length - 1 ||
              (sectionMessageCounts[currentSectionIndex] || paragraphMessageCounts[currentParagraph] || 0) === 0
            }
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentSectionIndex < validatedIndexes.length - 1 ? "Next Section" : "Continue"}
            <span className="ml-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </span>
          </button>
        </div>

        {/* Section Content */}
        <div className="prose max-w-none h-[calc(100vh-300px)] overflow-y-auto">
          <div className="section p-4 bg-blue-50 rounded-md border-l-4 border-primary">
            {currentSection.map((item, index) => (
              <div key={index} className="mb-6">
                {/* Handle string and different ContentItem types */}
                {typeof item === 'string' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item}
                  </ReactMarkdown>
                ) : item.type === 'text' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.content}
                  </ReactMarkdown>
                ) : item.type === 'image' ? (
                  <div className="my-4">
                    <img
                      src={item.content}
                      alt={`Image ${index + 1}`}
                      className="max-w-full rounded-md shadow-md"
                      loading="lazy"
                    />
                  </div>
                ) : item.type === 'html' ? (
                  <div className="my-4 w-full">
                    <div className="relative" style={{ paddingTop: '56.25%' }}>
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta charset="utf-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1">
                              <style>
                                body {
                                  margin: 0;
                                  padding: 10px;
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                }
                                * { box-sizing: border-box; }
                              </style>
                            </head>
                            <body>
                              ${item.content}
                            </body>
                          </html>
                        `}
                        title={`HTML Content ${index + 1}`}
                        className="absolute top-0 left-0 w-full h-full rounded-md shadow-md border border-gray-200"
                        sandbox="allow-scripts allow-popups allow-forms"
                        loading="lazy"
                        onLoad={(e) => {
                          // Attempt to adjust height based on content
                          try {
                            const iframe = e.target as HTMLIFrameElement;
                            const iframeHeight = iframe.contentWindow?.document.body.scrollHeight;
                            if (iframeHeight && iframeHeight > 0) {
                              iframe.style.height = `${iframeHeight + 20}px`;
                            }
                          } catch (err) {
                            console.error('Error adjusting iframe height:', err);
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                      <p className="italic">Interactive HTML content</p>
                      <button
                        onClick={() => {
                          // Open in a new tab
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(item.content);
                            win.document.close();
                          }
                        }}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        View Fullscreen
                      </button>
                    </div>
                  </div>
                ) : item.type === 'conclusion' ? (
                  <div className="my-4 p-4 border border-green-200 rounded-md bg-green-50">
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        {item.instructions || "Write your conclusion based on what you've learned."}
                      </p>

                      <div>
                        <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700">
                          Your Conclusion
                        </label>
                        <textarea
                          id="conclusion"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 resize-none p-3 border"
                          rows={12}
                          defaultValue={item.content || ""}
                          placeholder="Write your conclusion here..."
                        ></textarea>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            // Get the current content from the textarea
                            const textarea = document.getElementById("conclusion") as HTMLTextAreaElement;
                            const conclusion = textarea?.value || "";

                            // Save the conclusion
                            try {
                              const userId = localStorage.getItem("userId");
                              const response = await fetch("/api/save-conclusion", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  conclusion,
                                  userId,
                                }),
                              });

                              if (!response.ok) {
                                throw new Error("Failed to save conclusion");
                              }

                              // Show success message
                              alert("Conclusion saved successfully!");
                            } catch (error) {
                              console.error("Error saving conclusion:", error);
                              alert("Error saving conclusion. Please try again.");
                            }
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                        >
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
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500">Unsupported content type: {item.type}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionReader;