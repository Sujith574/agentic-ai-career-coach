import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginCard({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP request failed");
      setOtpRequested(true);
      setDemoOtp(data.demo_otp || "");
    } catch (err) {
      setError(err.message || "Could not request OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verification failed");
      onLoginSuccess(data.session);
    } catch (err) {
      setError(err.message || "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-800">
      <h2 className="text-2xl font-semibold text-white">OTP Login</h2>
      <p className="mt-2 text-sm text-slate-400">
        Login for all user types before using Agentic AI Career Coach.
      </p>

      {!otpRequested ? (
        <form className="mt-5 space-y-3" onSubmit={requestOtp}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-70"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={verifyOtp}>
          <input
            type="text"
            required
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {demoOtp ? (
            <p className="text-xs text-amber-300">Demo OTP (email fallback): {demoOtp}</p>
          ) : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify OTP & Login"}
          </button>
        </form>
      )}
    </div>
  );
}
