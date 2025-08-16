// import { useState } from "react";
// import axios from "axios";

// function App() {
//   const [transcript, setTranscript] = useState("");
//   const [prompt, setPrompt] = useState("");
//   const [summary, setSummary] = useState("");
//   const [email, setEmail] = useState("");

//   const handleSummarize = async () => {
//     const res = await axios.post("http://localhost:5000/api/summarize", { transcript, prompt });
//     setSummary(res.data.summary);
//   };

//   const handleSendEmail = async () => {
//     await axios.post("http://localhost:5000/api/email", { to: email, summary });
//     alert("Email Sent!");
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>AI Meeting Summarizer</h2>

//       <textarea placeholder="Paste Transcript Here..." value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={6} cols={60} />
//       <br /><br />

//       <input type="text" placeholder="Enter custom instruction..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
//       <button onClick={handleSummarize}>Generate Summary</button>

//       <br /><br />
//       <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} cols={60} />

//       <br /><br />
//       <input type="email" placeholder="Recipient Email" value={email} onChange={(e) => setEmail(e.target.value)} />
//       <button onClick={handleSendEmail}>Send via Email</button>
//     </div>
//   );
// }

// export default App;


import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(false);
  const readTextFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setTranscript(String(e.target.result || ""));
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.includes("text")) readTextFile(file);
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      setNotice("Please paste or upload a transcript first.");
      return;
    }
    setNotice("");
    setLoading(true);
    try {
      const res = await axios.post("http://ai-summary-project-backend.onrender.com/api/summarize", {
        transcript,
        prompt: prompt || "Summarize the key decisions, deadlines, and owners in bullet points."
      });
      setSummary(res.data.summary || "");
    } catch (err) {
      setNotice("Failed to generate summary. Check backend/Groq API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setNotice("Enter recipient email.");
      return;
    }
    if (!summary.trim()) {
      setNotice("Nothing to send. Generate or write a summary first.");
      return;
    }
    setNotice("");
    setSending(true);
    try {
      await axios.post("http://ai-summary-project-backend.onrender.com/api/email", {
        to: email,
        summary
      });
      setNotice("✅ Email sent successfully!");
    } catch (err) {
      setNotice("❌ Failed to send email. Check EMAIL_USER/PASS and server logs.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };
  const sendEmail = async () => {
    // email send ka logic yahan call kar
    setToast(true);
    setTimeout(() => setToast(false), 3000); // 3 sec baad gayab
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Meeting Summarizer</h1>
        <p className="muted">Upload transcript → add instructions → generate → edit → email</p>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <main className="grid">
        {/* LEFT: Transcript + Prompt */}
        <section className="card">
          <h2>1) Transcript</h2>

          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            title="Click to choose a .txt file or drag & drop"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              hidden
              onChange={(e) => readTextFile(e.target.files?.[0])}
            />
            <div className="drop-hint">
              <span className="badge">TXT</span> Drag & drop or <u>click to upload</u>
            </div>
          </div>

          <textarea
            className="textarea"
            rows={10}
            placeholder="Paste transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />

          <h3 className="subheading">2) Instruction / Prompt (optional)</h3>
          <input
            className="input"
            type="text"
            placeholder='e.g., "Summarize in bullet points for executives"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button className="btn primary" onClick={handleSummarize} disabled={loading}>
            {loading ? "Generating…" : "Generate Summary"}
          </button>
        </section>

        {/* RIGHT: Summary + Email */}
        <section className="card">
          <h2>3) Summary (Editable)</h2>
          <textarea
            className="textarea"
            rows={14}
            placeholder="Your summary will appear here. You can edit before sending."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <h3 className="subheading">4) Share via Email</h3>
          <div className="row">
            <input
              className="input"
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" onClick={handleSendEmail} disabled={sending}>
              {sending ? "Sending…" : "Send Email"}
            </button>
          </div>
      {/* Popup Toast */}
      <div className={`toast ${toast ? "show" : ""}`}>
        ✅ Email sent successfully!
      </div>
          <p className="tiny muted">
            Tip: Use a Gmail App Password in your backend env for Nodemailer.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span className="tiny muted">Single-user demo • MERN + Groq • Focused on functionality</span>
      </footer>
    </div>
  );
}
