import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  FileText,
  Link,
  MessageSquare,
  Play,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { analyzeFile, analyzeUrl, askQuestion } from "./api";

const features = [
  { icon: FileText, title: "Transcription", text: "Convert speech into searchable text" },
  { icon: Sparkles, title: "AI Summary", text: "Get a concise meeting overview" },
  { icon: Check, title: "Meeting Insights", text: "Extract actions and decisions" },
  { icon: MessageSquare, title: "RAG Chat", text: "Ask questions about your video" },
];

function App() {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("english");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  async function handleAnalyze() {
    setError("");
    setLoading(true);

    try {
      const data =
        mode === "url"
          ? await analyzeUrl(url.trim(), language)
          : await analyzeFile(file, language);

      setResult(data);
      setTab("overview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setUrl("");
    setFile(null);
    setError("");
    setTab("overview");
  }

  if (loading) {
    return <ProcessingScreen />;
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        tab={tab}
        setTab={setTab}
        reset={reset}
      />
    );
  }

  return (
    <div className="app">
      <Header />

      <main>
        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={14} />
            AI MEETING INTELLIGENCE
          </div>

          <h1>
            Turn videos into
            <span> actionable intelligence.</span>
          </h1>

          <p className="hero-description">
            Upload a video or paste a YouTube URL. Get a transcript,
            professional summary, decisions, action items and an AI chat
            interface for your meeting.
          </p>

          <div className="analyzer-card">
            <div className="source-tabs">
              <button
                className={mode === "url" ? "active" : ""}
                onClick={() => setMode("url")}
              >
                <Link size={16} />
                YouTube URL
              </button>

              <button
                className={mode === "file" ? "active" : ""}
                onClick={() => setMode("file")}
              >
                <Upload size={16} />
                Upload file
              </button>
            </div>

            {mode === "url" ? (
              <div className="url-input">
                <Link size={18} />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  onKeyDown={(e) => e.key === "Enter" && url && handleAnalyze()}
                />
              </div>
            ) : (
              <label className="upload-box">
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload size={28} />
                <strong>
                  {file ? file.name : "Choose an audio or video file"}
                </strong>
                <span>
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                    : "MP4, MOV, WEBM, MP3, WAV, M4A"}
                </span>
              </label>
            )}

            <div className="analyzer-controls">
              <div className="language-control">
                <span>Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>

              <button
                className="primary-button"
                disabled={mode === "url" ? !url.trim() : !file}
                onClick={handleAnalyze}
              >
                <Play size={16} />
                Analyze video
                <ArrowRight size={16} />
              </button>
            </div>

            {error && (
              <div className="error-message">
                <X size={16} />
                {error}
              </div>
            )}
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <Sparkles size={17} />
        </div>
        <span>AI Video Assistant</span>
      </div>

      <div className="status">
        <span className="status-dot" />
        AI pipeline ready
      </div>
    </header>
  );
}

function ProcessingScreen() {
  return (
    <div className="app centered-page">
      <Header />

      <div className="processing">
        <div className="processing-icon">
          <Zap size={27} />
        </div>

        <div className="eyebrow">PROCESSING VIDEO</div>
        <h2>Analyzing your meeting</h2>
        <p>
          Your video is being transcribed and analyzed. This can take a
          little while for longer videos.
        </p>

        <div className="loading-line">
          <span />
        </div>

        <div className="processing-steps">
          <span><Check size={14} /> Audio processing</span>
          <span><Check size={14} /> Transcription</span>
          <span><Sparkles size={14} /> AI analysis</span>
          <span><MessageSquare size={14} /> RAG preparation</span>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ result, tab, setTab, reset }) {
  return (
    <div className="app">
      <Header />

      <main className="results-page">
        <div className="result-header">
          <div>
            <div className="eyebrow">
              <Check size={14} />
              ANALYSIS COMPLETE
            </div>
            <h2>{result.title}</h2>
            <p>Your meeting intelligence is ready.</p>
          </div>

          <button className="secondary-button" onClick={reset}>
            + New analysis
          </button>
        </div>

        <div className="result-tabs">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
            Overview
          </button>
          <button className={tab === "transcript" ? "active" : ""} onClick={() => setTab("transcript")}>
            Transcript
          </button>
          <button className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}>
            Insights
          </button>
          <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>
            Ask AI
          </button>
        </div>

        {tab === "overview" && (
          <Overview result={result} setTab={setTab} />
        )}

        {tab === "transcript" && (
          <Transcript text={result.transcript} />
        )}

        {tab === "insights" && (
          <Insights result={result} />
        )}

        {tab === "chat" && <Chat />}
      </main>

      <Footer />
    </div>
  );
}

function Overview({ result, setTab }) {
  return (
    <div className="results-grid">
      <section className="result-card wide">
        <CardTitle icon={<Sparkles />} title="Executive summary" />
        <div className="summary-text">{result.summary}</div>
      </section>

      <section className="result-card">
        <CardTitle icon={<Check />} title="Key decisions" />
        <ResultList text={result.key_decisions} />
      </section>

      <section className="result-card">
        <CardTitle icon={<Zap />} title="Action items" />
        <ResultList text={result.action_items} />
      </section>

      <section className="result-card">
        <CardTitle icon={<MessageSquare />} title="Open questions" />
        <ResultList text={result.open_questions} />
      </section>

      <section className="result-card">
        <CardTitle icon={<FileText />} title="Transcript preview" />
        <p className="preview">
          {result.transcript?.slice(0, 1000)}
          {result.transcript?.length > 1000 ? "..." : ""}
        </p>
        <button className="text-button" onClick={() => setTab("transcript")}>
          Read full transcript <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}

function Insights({ result }) {
  return (
    <div className="results-grid three">
      <section className="result-card">
        <CardTitle icon={<Zap />} title="Action items" />
        <ResultList text={result.action_items} />
      </section>

      <section className="result-card">
        <CardTitle icon={<Check />} title="Key decisions" />
        <ResultList text={result.key_decisions} />
      </section>

      <section className="result-card">
        <CardTitle icon={<MessageSquare />} title="Open questions" />
        <ResultList text={result.open_questions} />
      </section>
    </div>
  );
}

function Transcript({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="result-card transcript-card">
      <div className="card-heading">
        <CardTitle icon={<FileText />} title="Full transcript" />
        <button className="icon-button" onClick={copy}>
          <Clipboard size={15} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre>{text}</pre>
    </section>
  );
}

function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  async function send() {
    if (!question.trim()) return;

    const q = question.trim();
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);

    try {
      const data = await askQuestion(q);
      setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Error: ${error.message}` },
      ]);
    }
  }

  return (
    <section className="chat-card">
      <div className="chat-header">
        <div>
          <div className="eyebrow">
            <MessageSquare size={14} />
            RAG CHAT
          </div>
          <h3>Ask anything about your meeting</h3>
          <p>Answers are grounded in the analyzed transcript.</p>
        </div>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <MessageSquare size={30} />
            <strong>Ask your meeting</strong>
            <span>Try “What were the main decisions?”</span>
          </div>
        )}

        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={index}>
            <div className="message-avatar">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div>
              <small>{message.role === "user" ? "You" : "Assistant"}</small>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a question about the transcript..."
        />
        <button onClick={send}>
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function CardTitle({ icon, title }) {
  return (
    <div className="card-title">
      <span>{icon}</span>
      <h3>{title}</h3>
    </div>
  );
}

function ResultList({ text = "" }) {
  const items = text
    .split(/\n+/)
    .map((item) => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  return (
    <ul className="result-list">
      {items.map((item, index) => (
        <li key={index}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </li>
      ))}
    </ul>
  );
}

function Footer() {
  return (
    <footer>
      AI Video Assistant · React + Vite frontend
    </footer>
  );
}

export default App;