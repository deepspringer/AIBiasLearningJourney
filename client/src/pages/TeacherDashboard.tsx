// components/teacher-dashboard.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserActivity } from "@/lib/userActivity";

export default function TeacherDashboard() {
    const userActivity = getUserActivity();
    const { toast } = useToast();

    //   useEffect(() => {
    //     const fetchStudentData = async () => {
    //       try {
    //         const response = await fetch("/api/teacher/student-activity");
    //         if (!response.ok) {
    //           throw new Error("Failed to fetch student data");
    //         }
    //         const data = await response.json();
    //         setStudents(data.students);
    //       } catch (error) {
    //         console.error("Error fetching student data:", error);
    //         toast({
    //           title: "Error",
    //           description: "Could not load student data",
    //           variant: "destructive",
    //         });
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     };

    //     fetchStudentData();
    //     const interval = setInterval(fetchStudentData, 60000); // Refresh every minute

    //     return () => clearInterval(interval);
    //   }, [toast]);

    if (!userActivity) {
        return (
            <div className="p-8 text-center">
                <p>No user activity data found.</p>
                <p>Please log in to track your progress.</p>
            </div>
        );
    }

    const getPhaseName = (phase: number) => {
        switch (phase) {
            case 1:
                return "LOOK Phase";
            case 2:
                return "THINK Phase";
            case 3:
                return "DO Phase";
            default:
                return "Unknown Phase";
        }
    };

    const getActivityStatus = (lastActive: string) => {
        const minutesAgo = Math.floor(
            (new Date().getTime() - new Date(lastActive).getTime()) / 60000
        );

        if (minutesAgo < 2) return "Active now";
        if (minutesAgo < 5) return "Active recently";
        if (minutesAgo < 15) return "Few minutes ago";
        return "Inactive";
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Teacher Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">{userActivity.displayName}</h2>
                        <div className="flex items-center mt-2">
                            <span
                                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                    getActivityStatus(userActivity.lastActive).includes(
                                        "Active now"
                                    )
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                }`}></span>
                            <span>{getActivityStatus(userActivity.lastActive)}</span>
                        </div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                        {getPhaseName(userActivity.currentPhase)}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-medium mb-2">Current Progress (Phase)</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(userActivity.currentPhase / 3) * 100}%` }}></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {userActivity.currentPhase === 1
                            ? `Paragraph ${userActivity.currentParagraph || 1}`
                            : `Phase ${userActivity.currentPhase} of 3`}
                    </div>
                </div>

                <div>
                    <h3 className="font-medium mb-3">Recent Messages</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {userActivity.messages.slice(-5).map((message, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg ${
                                    message.role === "user"
                                        ? "bg-blue-50 text-blue-800"
                                        : "bg-gray-50 text-gray-800"
                                }`}>
                                <div className="font-medium">
                                    {message.role === "user" ? "You" : "Assistant"}:
                                </div>
                                <p className="mt-1">{message.content}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
