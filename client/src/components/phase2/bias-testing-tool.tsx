import { useState, useEffect } from "react";

interface BiasTestingToolProps {
  onSendMessage: (message: string) => void;
}

const BiasTestingTool = ({ onSendMessage }: BiasTestingToolProps) => {
  const [experimentHtml, setExperimentHtml] = useState("");

  useEffect(() => {
    // Get the selected module's experiment HTML from the parent component
    console.log("Fetching experiment HTML from module data");
    const module = document.querySelector("[data-selected-module]");
    console.log("Module found:", module);
    if (module) {
      console.log("Module");
      const html = module.getAttribute("data-experiment-html");
      console.log("HTML:", html);
      if (html) {
        console.log("Setting experiment HTML");
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
