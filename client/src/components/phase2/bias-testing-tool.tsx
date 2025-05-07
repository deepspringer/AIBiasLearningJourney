import { useState, useEffect } from "react";

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

  useEffect(() => {
    console.log("[BiasTestingTool] experimentHtml changed:", experimentHtml);
  }, [experimentHtml]);

  return (
    <div id="phase-2" className="phase-content">
      <div dangerouslySetInnerHTML={{ __html: experimentHtml }} />
    </div>
  );
};

export default BiasTestingTool;
