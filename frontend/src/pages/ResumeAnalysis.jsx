import { useState, useRef } from "react";
import { Card, Button, Input } from "../components/ui/Base";
import { Loader } from "../components/ui/Loader";
import { apiRequest } from "../services/apiClient";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await apiRequest("/api/v1/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (res.analysis) {
        setAnalysis(res.analysis);
      } else {
        setError("Analysis failed. Please try a different file.");
      }
    } catch (err) {
      setError("Failed to upload. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 px-4">
      <header className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-white">Advanced Resume Analyzer</h2>
           <p className="text-slate-400 mt-2">Get professional feedback on your profile in seconds.</p>
        </div>
        <Button variant="secondary" onClick={() => window.close()} className="gap-2">
           <ArrowLeft className="h-4 w-4" /> Close Tab
        </Button>
      </header>

      {!analysis ? (
        <Card className="p-20 flex flex-col items-center justify-center border-dashed border-2 border-slate-700 bg-slate-950/20">
           <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8">
              <Upload className="h-12 w-12 text-indigo-400" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Upload your resume</h3>
           <p className="text-sm text-slate-500 mb-8 max-w-xs text-center">
             We support PDF and Word documents. Our AI will analyze your skills and placement probability.
           </p>
           
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileChange}
             accept=".pdf,.doc,.docx"
           />
           
           <div className="flex flex-col items-center gap-4 w-full max-w-xs">
             <Button 
                variant="secondary" 
                className="w-full border-white/5"
                onClick={() => fileInputRef.current?.click()}
             >
                {file ? file.name : "Select Document"}
             </Button>
             
             <Button 
                className="w-full h-12"
                onClick={handleUpload}
                disabled={!file || isUploading}
             >
                {isUploading ? <Loader size="sm" /> : "Start Deep Analysis"}
             </Button>
           </div>
           
           {error && <p className="mt-4 text-sm text-rose-400 font-medium">{error}</p>}
        </Card>
      ) : (
        <div className="space-y-8">
           <Card className="bg-indigo-600/5 border-indigo-500/20">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                       <BarChart className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white">Analysis Results</h3>
                       <p className="text-xs text-slate-500">Based on your latest profile scan</p>
                    </div>
                 </div>
                 <Button variant="secondary" size="sm" onClick={() => setAnalysis(null)}>Upload New</Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-6">
                    <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Placement Probability</p>
                       <div className="flex items-end gap-3">
                          <span className="text-5xl font-black text-white">{analysis.placement_probability}%</span>
                          <span className="text-sm text-indigo-400 font-bold mb-1">Score.Optimal</span>
                       </div>
                    </div>

                    <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Suggested Roles</p>
                       <div className="flex flex-wrap gap-2">
                          {analysis.suggested_roles.map(role => (
                            <span key={role} className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-sm text-white">{role}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Skills Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills.map(s => (
                            <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">{s}</span>
                          ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Gap Analysis</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missing_skills.map(s => (
                            <span key={s} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">{s}</span>
                          ))}
                        </div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="bg-slate-900 border-white/5">
              <h4 className="text-lg font-bold text-white mb-4">AI Recommendations</h4>
              <p className="text-slate-400 leading-relaxed text-sm">
                Your profile shows strong potential in {analysis.experience_level} level roles. We recommend focusing on 
                projects that demonstrate {analysis.missing_skills.join(", ")} to increase your marketability.
              </p>
           </Card>
        </div>
      )}
    </div>
  );
}
