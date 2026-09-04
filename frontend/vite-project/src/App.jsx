import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const handleSubmit = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const uploadRes = await axios.post("https://resume-screener-backend-ezy1.onrender.com/upload-resume", formData);
      const resumeText = uploadRes.data.extracted_text;

      const matchFormData = new FormData();
      matchFormData.append("resume_text", resumeText);
      matchFormData.append("job_description", jobDescription);
      const matchRes = await axios.post("https://resume-screener-backend-ezy1.onrender.com/match", matchFormData);

      setMatchScore(matchRes.data.match_score);
      setMatchedKeywords(matchRes.data.matched_keywords);
      setMissingKeywords(matchRes.data.missing_keywords);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check the backend is running.");
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#2ecc71";
    if (score >= 40) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <div className="app-container" data-theme={theme}>
      <div className="top-bar">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <h1 className="app-title">AI Resume Screening System</h1>
      <p className="app-subtitle">Upload a resume and job description to check the match</p>

      <div className="form-group">
        <label className="form-label">Upload Resume (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          className="file-input"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea
          rows="6"
          className="textarea-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Checking..." : "Check Match"}
      </button>

      {matchScore !== null && (
        <div
          className="result-box"
          style={{ background: `${getScoreColor(matchScore)}15` }}
        >
          <p className="result-score" style={{ color: getScoreColor(matchScore) }}>
            {matchScore}%
          </p>
          <p className="result-label">Match Score</p>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${matchScore}%`,
                background: getScoreColor(matchScore),
              }}
            />
          </div>

          <div className="feedback-grid">
            <div className="feedback-card good">
              <h4>✓ Matched Skills</h4>
              <ul>
                {matchedKeywords.length > 0
                  ? matchedKeywords.map((k, i) => <li key={i}>{k}</li>)
                  : <li>None found</li>}
              </ul>
            </div>
            <div className="feedback-card bad">
              <h4>⚠ Missing Skills</h4>
              <ul>
                {missingKeywords.length > 0
                  ? missingKeywords.map((k, i) => <li key={i}>{k}</li>)
                  : <li>None</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;