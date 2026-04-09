import { useState } from "react";

export default function UploadResume({ onUploaded, loading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    await onUploaded(file, setError);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-blue-400/20 bg-slate-900/60 p-7 shadow-xl">
      <h2 className="text-2xl font-semibold text-white">Upload Resume</h2>
      <p className="mt-2 text-sm text-slate-300">
        Upload a PDF resume to instantly analyze skills, task gaps, and placement readiness.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:from-blue-500 hover:file:to-indigo-500"
        />

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onUploaded(null, setError)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Run Demo Mode
        </button>
      </form>
    </div>
  );
}
