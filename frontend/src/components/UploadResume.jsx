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
    <div className="rounded-2xl bg-slate-900 p-6 shadow-xl ring-1 ring-slate-800">
      <h2 className="text-2xl font-semibold text-white">Upload Resume</h2>
      <p className="mt-2 text-sm text-slate-400">
        Upload a PDF resume to instantly analyze skills, task gaps, and placement readiness.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
        />

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>
    </div>
  );
}
