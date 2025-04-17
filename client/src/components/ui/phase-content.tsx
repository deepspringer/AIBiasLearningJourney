import { ReactNode } from "react";

type Phase = 1 | 2 | 3;

interface PhaseContentProps {
  currentPhase: Phase;
  children: ReactNode;
}

const PhaseContent = ({ currentPhase, children }: PhaseContentProps) => {
  return (
    <div className="w-full lg:w-7/12 order-1 lg:order-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default PhaseContent;
