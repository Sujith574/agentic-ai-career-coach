import { useMemo, useState } from "react";
import Dashboard from "../components/Dashboard";
import LoginCard from "../components/LoginCard";
import UploadResume from "../components/UploadResume";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const demoResume = {
  skills: ["Python", "HTML", "SQL", "React"],
  missing_skills: ["DSA", "System Design"],
  projects: 1,
  experience_level: "Beginner",
  suggested_roles: ["Frontend Developer", "Software Engineer"],
  placement_probability: 62,
  resume_text: "Demo fallback candidate profile.",
};

export default function Home() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("career_coach_session");
    return raw ? JSON.parse(raw) : null;
  });
  const [analysis, setAnalysis] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [mockQuestions, setMockQuestions] = useState(null);

  const headerSubtitle = useMemo(
    () =>
      analysis
        ? "Agentic recommendations generated based on your resume."
        : "Upload your resume to start AI-powered placement coaching.",
    [analysis]
  );

  const runTaskGeneration = async (resumeData) => {
    try {
      const response = await fetch(`${API_URL}/generate-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeData }),
      });
      if (!response.ok) throw new Error("tasks API failed");
      const data = await response.json();
      setTasks(data);
    } catch {
      setTasks([
        { task: "Solve 10 DSA problems daily", priority: "High", status: "Pending" },
        { task: "Build 2 real-world projects", priority: "High", status: "Pending" },
      ]);
    }
  };

  const handleUploadResume = async (file, setError) => {
    setLoading(true);
    setMockQuestions(null);
    setChatMessages([]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("resume", file);
      }

      const response = await fetch(`${API_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("upload failed");
      const data = await response.json();
      setAnalysis(data);
      await runTaskGeneration(data);
    } catch {
      if (setError) {
        setError("Resume processing failed. Showing demo data.");
      }
      setAnalysis(demoResume);
      await runTaskGeneration(demoResume);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (message) => {
    const nextMessages = [...chatMessages, { role: "user", content: message }];
    setChatMessages(nextMessages);
    setChatLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: analysis || demoResume }),
      });
      if (!response.ok) throw new Error("chat failed");
      const data = await response.json();
      setChatMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setChatMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Prioritize DSA and project depth. Daily plan: 10 DSA problems, 2 hours project work, and 5 applications.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const startMockInterview = async () => {
    setMockLoading(true);
    try {
      const response = await fetch(`${API_URL}/mock-interview`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("mock interview failed");
      const data = await response.json();
      setMockQuestions(data);
    } catch {
      setMockQuestions({
        technical: [
          "Explain how React rendering works and when to use memoization.",
          "How would you design a REST API for task management?",
          "What are two strategies to improve SQL query performance?",
        ],
        hr: [
          "Describe your biggest learning challenge and how you solved it.",
          "Why should we hire you for this role?",
        ],
      });
    } finally {
      setMockLoading(false);
    }
  };

  const toggleTaskStatus = (idx) => {
    setTasks((prev) =>
      prev.map((task, index) =>
        index === idx
          ? { ...task, status: task.status === "Pending" ? "Completed" : "Pending" }
          : task
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">Agentic AI Career Coach</h1>
          <p className="mt-2 text-sm text-slate-400">{headerSubtitle}</p>
        </header>

        {!session ? (
          <LoginCard
            onLoginSuccess={(data) => {
              setSession(data);
              localStorage.setItem("career_coach_session", JSON.stringify(data));
            }}
          />
        ) : !analysis ? (
          <UploadResume onUploaded={handleUploadResume} loading={loading} />
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                onClick={() => {
                  setSession(null);
                  setAnalysis(null);
                  localStorage.removeItem("career_coach_session");
                }}
              >
                Logout ({session.role})
              </button>
            </div>
            <Dashboard
              analysis={analysis}
              tasks={tasks}
              onToggleTask={toggleTaskStatus}
              chatMessages={chatMessages}
              onChatSend={handleSendChat}
              chatLoading={chatLoading}
              onStartMockInterview={startMockInterview}
              mockQuestions={mockQuestions}
              mockLoading={mockLoading}
            />
          </>
        )}
      </div>
    </main>
  );
}
