import { type Dispatch, type SetStateAction } from "react";

type Phase = 1 | 2 | 3;

interface PhaseNavigationProps {
  currentPhase: Phase;
  onPhaseChange: Dispatch<SetStateAction<Phase>>;
  isPhase2Unlocked: boolean;
  isPhase3Unlocked: boolean;
}

const PhaseNavigation = ({ currentPhase, onPhaseChange, isPhase2Unlocked, isPhase3Unlocked }: PhaseNavigationProps) => {
  const phases = [
    { id: 1, name: "1: Learn", icon: "menu_book" },
    { id: 2, name: "2: Experiment", icon: "psychology" },
    { id: 3, name: "3: Conclude", icon: "edit_note" },
  ];

  return (
    <nav className="flex space-x-1 sm:space-x-4">
      {phases.map((phase) => (
        <button
          key={phase.id}
          onClick={() => onPhaseChange(phase.id as Phase)}
          disabled={phase.id === 2 ? !isPhase2Unlocked : phase.id === 3 ? !isPhase3Unlocked : false}
          className={`flex flex-col items-center px-3 py-2 text-sm font-medium rounded-md 
            ${
              currentPhase === phase.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }
            ${
              (phase.id === 2 && !isPhase2Unlocked) || (phase.id === 3 && !isPhase3Unlocked)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
        >
          <span className="mb-1">
            {phase.icon === "menu_book" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            )}
            {phase.icon === "psychology" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11.9c.64 0 1.24-.32 1.6-.86A1.86 1.86 0 0 0 14 9.86c0-.52-.2-1.01-.56-1.38A1.8 1.8 0 0 0 12 8.06c-.63 0-1.23.33-1.59.86A1.86 1.86 0 0 0 10 9.86c0 .52.2 1.01.56 1.38 .36.37.85.59 1.38.59"></path>
                <path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path>
                <path d="M9 17c0-3 1-5 3-5s3 2 3 5"></path>
                <path d="M9 10.2V10"></path>
                <path d="M15 10.2V10"></path>
              </svg>
            )}
            {phase.icon === "edit_note" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"></path>
                <path d="M8 7h4"></path>
                <path d="M8 11h4"></path>
                <path d="M8 15h4"></path>
              </svg>
            )}
          </span>
          <span>{phase.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default PhaseNavigation;
