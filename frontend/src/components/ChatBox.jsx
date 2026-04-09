import { useState } from "react";

export default function ChatBox({ messages, onSend, loading }) {
  const [input, setInput] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  return (
    <div className="rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
      <h3 className="text-lg font-semibold text-white">AI Mentor Chat</h3>
      <div className="mt-4 h-64 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Ask: What should I do?</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-blue-500 focus:ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
