import { useState, useEffect } from "react";

interface BiasTestingToolProps {
  onSendMessage: (message: string) => void;
  experimentHtml: string;
}

const BiasTestingTool = ({ onSendMessage, experimentHtml }: BiasTestingToolProps) => {

  return (
    <div id="phase-2" className="phase-content">
      <div dangerouslySetInnerHTML={{ __html: experimentHtml }} />
    </div>
  );
};

export default BiasTestingTool;
