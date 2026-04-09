import { useEffect, useMemo, useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import SidebarNav from "../components/SidebarNav";
import StudentDashboard from "../components/StudentDashboard";
import { apiRequest } from "../services/apiClient";

const demoResume = {
  skills: ["HTML", "CSS"],
  missing_skills: ["DSA", "React"],
  projects: 1,
  experience_level: "Beginner",
  suggested_roles: ["Frontend Developer"],
  placement_probability: 55,
  resume_text: "Demo fallback candidate profile with no internships.",
};

export default function Home() {
  const initialTab = window.location.pathname.includes("admin-dashboard") ? "admin" : "student";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [analysis, setAnalysis] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [mockQuestions, setMockQuestions] = useState(null);
  const [students, setStudents] = useState([]);
  const [insights, setInsights] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!analysis) return undefined;

    const interval = setInterval(() => {
      setTimelineEvents((prev) => {
        const pendingCount = tasks.filter((task) => task.status === "Pending").length;
        const pulseEvent = {
          timestamp: new Date().toISOString(),
          stage: "act",
          message:
            pendingCount > 0
              ? `Live pulse: ${pendingCount} pending task(s) still being monitored`
              : "Live pulse: all tasks complete, tracking consistency",
          meta: { pulse: true, pendingCount },
        };
        return [pulseEvent, ...prev].slice(0, 60);
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [analysis, tasks]);

  const headerSubtitle = useMemo(
    () =>
      analysis
        ? "Agentic recommendations generated based on your resume."
        : "Upload your resume to start AI-powered placement coaching.",
    [analysis]
  );

  const runTaskGeneration = async (resumeData) => {
    const fallbackTimeline = [
      {
        timestamp: new Date().toISOString(),
        stage: "analyze",
        message: "Detected gap: DSA not present in skill profile",
      },
      {
        timestamp: new Date().toISOString(),
        stage: "decide",
        message: "Created task: Solve 10 DSA problems daily",
      },
      {
        timestamp: new Date().toISOString(),
        stage: "act",
        message: "Raised alert: Daily DSA practice is overdue",
      },
    ];

    try {
      const data = await apiRequest(
        "/generate-tasks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeData }),
        },
        { retries: 1, timeoutMs: 15000 }
      );
      const generatedTasks = data || [];
      setTasks(generatedTasks);
      try {
        await apiRequest(
          "/admin/sync-current-student",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ analysis: resumeData, tasks: generatedTasks }),
          },
          { retries: 0, timeoutMs: 10000 }
        );
        await loadAdminData();
      } catch {
        // Keep student flow resilient even if admin sync fails.
      }
      setTimelineEvents(fallbackTimeline);
    } catch {
      setTasks([
        { title: "Solve 10 DSA problems daily", priority: "High", status: "Pending" },
        { title: "Build 2 real-world projects", priority: "High", status: "Pending" },
        { title: "Apply to internships on LinkedIn", priority: "Medium", status: "Pending" },
      ]);
      setTimelineEvents(fallbackTimeline);
    }
  };

  const handleUploadResume = async (file, setError) => {
    setLoading(true);
    setMockQuestions(null);
    setChatMessages([]);
    setTimelineEvents([]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("resume", file);
      }

      const data = await apiRequest(
        "/upload-resume",
        {
          method: "POST",
          body: formData,
        },
        { retries: 1, timeoutMs: 30000 }
      );
      setAnalysis(data || demoResume);
      await runTaskGeneration(data || demoResume);
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
      const data = await apiRequest(
        "/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, context: analysis || demoResume }),
        },
        { retries: 1, timeoutMs: 20000 }
      );
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
      const profile = encodeURIComponent(JSON.stringify(analysis || demoResume));
      let data = await apiRequest("/mock-interview", { method: "GET" }, { retries: 1, timeoutMs: 15000 });
      if (!data?.technical?.length || !data?.hr?.length) {
        data = await apiRequest(`/mock-interview?profile=${profile}`, { method: "GET" }, { retries: 1, timeoutMs: 15000 });
      }
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

  const loadAdminData = async () => {
    try {
      const [studentData, insightData] = await Promise.all([
        apiRequest("/admin/students", { method: "GET" }, { retries: 0, timeoutMs: 10000 }),
        apiRequest("/admin/insights", { method: "GET" }, { retries: 0, timeoutMs: 10000 }),
      ]);
      setStudents(studentData.students || []);
      setInsights(insightData);
      if (!selectedStudent && studentData.students?.length) {
        setSelectedStudent(studentData.students[0]);
      }
    } catch {
      setStudents([]);
      setInsights(null);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleTaskStatus = (idx) => {
    setTasks((prev) =>
      prev.map((task, index) =>
        index === idx
          ? { ...task, status: task.status === "Pending" ? "Completed" : "Pending" }
          : task
      )
    );
  };

  const navigate = (item) => {
    setActiveTab(item.id);
    window.history.replaceState({}, "", item.path);
  };

  const pageTitle = useMemo(
    () =>
      activeTab === "student"
        ? "Student Dashboard - Personal AI Career Mentor"
        : "Admin Dashboard - TPC Placement Intelligence",
    [activeTab]
  );

  return (
    <main className="app-bg min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-400/20 bg-slate-950/50 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              SaaS Edition
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Agentic AI CareerOS</h1>
            <p className="mt-1 text-xs text-slate-400">AI Placement Operating System for Universities</p>
            <p className="mt-2 text-sm text-slate-300">{headerSubtitle}</p>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Autonomous Analyze {"->"} Decide {"->"} Act
          </span>
        </header>

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <SidebarNav current={activeTab} onNavigate={navigate} />
          <section className="glass-card rounded-2xl p-5 md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{pageTitle}</h2>
            {activeTab === "student" ? (
              <StudentDashboard
                analysis={analysis}
                tasks={tasks}
                timelineEvents={timelineEvents}
                chatMessages={chatMessages}
                chatLoading={chatLoading}
                mockLoading={mockLoading}
                mockQuestions={mockQuestions}
                loading={loading}
                onUploadResume={handleUploadResume}
                onToggleTask={toggleTaskStatus}
                onSendChat={handleSendChat}
                onStartMockInterview={startMockInterview}
              />
            ) : (
              <AdminDashboard
                insights={insights}
                students={students}
                selectedStudent={selectedStudent}
                onSelectStudent={setSelectedStudent}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
