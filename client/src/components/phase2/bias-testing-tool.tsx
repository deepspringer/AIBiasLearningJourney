
import { useState, useEffect } from "react";

interface BiasTestingToolProps {
  onSendMessage: (message: string) => void;
}

const BiasTestingTool = ({ onSendMessage }: BiasTestingToolProps) => {
  const [experimentHtml, setExperimentHtml] = useState("");

  useEffect(() => {
    // Get the selected module's experiment HTML from the parent component
    const module = document.querySelector("[data-selected-module]");
    if (module) {
      const html = module.getAttribute("data-experiment-html");
      if (html) {
        setExperimentHtml(html);
      } else {
        console.warn("No experiment HTML found in module data");
      }
    }
  }, []);

  return (
    <div id="phase-2" className="phase-content">
      <div dangerouslySetInnerHTML={{ __html: experimentHtml }} />
    </div>
  );
};

export default BiasTestingTool;
