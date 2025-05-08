
import { useState, useEffect, useRef } from "react";

interface BiasTestingToolProps {
  onSendMessage: (message: string) => void;
  experimentHtml: string;
}

const BiasTestingTool = ({
  onSendMessage,
  experimentHtml,
}: BiasTestingToolProps) => {
  console.log("[BiasTestingTool] Component mounted");
  console.log(
    "[BiasTestingTool] Received experimentHtml prop:",
    experimentHtml,
  );
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log("[BiasTestingTool] experimentHtml changed:", experimentHtml);
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(experimentHtml);
        iframeDoc.close();
      }
    }
  }, [experimentHtml]);

  return (
    <div id="phase-2" className="phase-content">
      <iframe 
        ref={iframeRef}
        className="w-full h-[600px] border-0"
        title="Bias Testing Tool"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default BiasTestingTool;
