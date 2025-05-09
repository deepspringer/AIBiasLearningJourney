type UserActivity = {
    userId: string;
    displayName: string;
    currentPhase: number;
    currentParagraph?: number;
    messages: {
        role: "user" | "assistant";
        content: string;
        timestamp: string;
    }[];
    lastActive: string;
};

export const initUserActivity = (userId: string, displayName: string) => {
    const activity = {
        userId,
        displayName,
        currentPhase: 1,
        messages: [],
        lastActive: new Date().toISOString(),
    };
    localStorage.setItem("userActivity", JSON.stringify(activity));
    return activity;
};

export const getUserActivity = (): UserActivity | null => {
    // if (typeof window === 'undefined') return null;
    const activity = localStorage.getItem("userActivity");
    return activity ? JSON.parse(activity) : null;
};

export const updateUserActivity = (updates: Partial<UserActivity>) => {
    const current = getUserActivity();
    if (!current) return null;

    const updated = {
        ...current,
        ...updates,
        lastActive: new Date().toISOString(),
    };
    localStorage.setItem("userActivity", JSON.stringify(updated));
    return updated;
};

export const addUserMessage = (message: { role: "user" | "assistant"; content: string }) => {
    const current = getUserActivity();
    if (!current) return null;

    const newMessage = {
        ...message,
        timestamp: new Date().toISOString(),
    };

    const updated = {
        ...current,
        messages: [...current.messages, newMessage],
        lastActive: new Date().toISOString(),
    };

    localStorage.setItem("userActivity", JSON.stringify(updated));
    return updated;
};
