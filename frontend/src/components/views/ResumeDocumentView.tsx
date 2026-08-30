import React, { useState } from 'react';
import { Copy, Check, Download, Printer, Sparkles, MapPin, Mail, Award, Briefcase, GraduationCap, CheckCircle2, ExternalLink } from 'lucide-react';

interface ResumeDocumentViewProps {
  markdown: string;
  structured?: any;
  targetCompany?: string;
  targetRole?: string;
  atsScore?: number;
}

export const ResumeDocumentView: React.FC<ResumeDocumentViewProps> = ({
  markdown,
  structured,
  targetCompany = 'Target Company',
  targetRole = 'GenAI / Agentic AI Engineer',
  atsScore = 96
}) => {
  const [viewMode, setViewMode] = useState<'recruiter' | 'ats'>('recruiter');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const candName = (structured?.name || 'Candidate').replace(/\s+/g, '_');
    a.download = `${candName}_Resume_${targetCompany.replace(/\s+/g, '_')}_${targetRole.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      alert('Please allow popups to export the PDF resume.');
      return;
    }

    const candName = structured?.name || 'Candidate';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${candName.replace(/\s+/g, '_')}_Resume_${targetCompany.replace(/\s+/g, '_')}</title>
        <style>
          @page {
            size: letter;
            margin: 0.5in 0.6in;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            font-size: 9.5pt;
            line-height: 1.35;
            margin: 0;
            padding: 0;
          }
          h1 {
            font-size: 16pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 2px 0;
            color: #0f172a;
            text-align: center;
          }
          .subtitle {
            font-size: 10pt;
            font-weight: 700;
            color: #047857;
            text-align: center;
            margin-bottom: 4px;
          }
          .contact-bar {
            text-align: center;
            font-size: 8.5pt;
            color: #4b5563;
            margin-bottom: 12px;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 6px;
          }
          .contact-bar a {
            color: #047857;
            text-decoration: none;
            font-weight: 600;
          }
          h2 {
            font-size: 10pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            margin: 10px 0 4px 0;
            padding-bottom: 2px;
          }
          .summary {
            font-size: 9pt;
            color: #334155;
            text-align: justify;
            margin-bottom: 8px;
          }
          .skill-category {
            margin-bottom: 3px;
            font-size: 9pt;
          }
          .skill-category strong {
            color: #0f172a;
            font-size: 9pt;
          }
          .exp-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 9.5pt;
            color: #0f172a;
            margin-top: 4px;
          }
          .exp-subheader {
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            font-weight: 600;
            color: #047857;
            margin-bottom: 3px;
          }
          ul {
            margin: 2px 0 6px 0;
            padding-left: 16px;
          }
          li {
            margin-bottom: 2.5px;
            color: #334155;
            font-size: 8.8pt;
          }
          li strong {
            color: #0f172a;
          }
          .proj-title {
            font-weight: 700;
            font-size: 9pt;
            color: #0f172a;
          }
          .proj-stack {
            font-size: 8pt;
            font-family: monospace;
            color: #047857;
            margin-left: 6px;
          }
        </style>
      </head>
      <body>
        <h1>Chenna Kesava Reddy Bhomireddy Gari</h1>
        <div class="subtitle">${targetRole} (Tailored for ${targetCompany})</div>
        <div class="contact-bar">
          Bengaluru, India • <a href="mailto:kesavac913@gmail.com">kesavac913@gmail.com</a> • 
          <a href="https://github.com/KesavaAI">github.com/KesavaAI</a> • 
          <a href="https://www.linkedin.com/in/chenna00/">linkedin.com/in/chenna00</a>
        </div>

        <h2>Professional Summary</h2>
        <div class="summary">
          GenAI & Agentic AI Engineer with ~1.6 years of production experience at Tata Consultancy Services (TCS) architecting enterprise autonomous multi-agent systems, LangGraph cyclical workflows, RAG pipelines, and high-concurrency FastAPI microservices. Specialized in deterministic agent execution, AST SQL validation, and Azure OpenAI cloud architectures. Specifically tailored for ${targetRole} at ${targetCompany}.
        </div>

        <h2>Core Technical Skills</h2>
        <div class="skill-category"><strong>GenAI & Agentic Frameworks:</strong> LangGraph, LangChain, Multi-Agent Orchestration, Prompt Engineering, Structured Outputs, Function Calling, Circuit Breakers</div>
        <div class="skill-category"><strong>RAG & Vector Retrieval:</strong> Hybrid Search (BM25 + Dense Vectors), Azure AI Search, ChromaDB, Qdrant, Reciprocal Rank Fusion, Cross-Encoder Reranking</div>
        <div class="skill-category"><strong>Languages & Infrastructure:</strong> Python (AsyncIO, Concurrency), FastAPI, SQL, PostgreSQL, REST APIs, Docker, CI/CD, Git</div>
        <div class="skill-category"><strong>Cloud, AI Platforms & Evaluation:</strong> Azure, Azure OpenAI (GPT-4o), Azure AI Studio, Ragas Benchmark, TruLens, AST Validation (SQLGlot)</div>

        <h2>Production Work Experience</h2>
        <div class="exp-header">
          <span>Tata Consultancy Services (TCS)</span>
          <span>Oct 2024 – Present</span>
        </div>
        <div class="exp-subheader">
          <span>${targetRole} • Production Engineering</span>
          <span>Bengaluru, India</span>
        </div>
        <ul>
          <li>Architected and engineered the <strong>TCS Agentic Data Intelligence</strong> platform, enabling enterprise conversational data analytics across relational databases with <strong>94.2% query accuracy</strong> (reduced turnaround from 4 days to 8 seconds).</li>
          <li>Designed a stateful multi-agent LangGraph workflow incorporating schema pruning, iterative planning, AST SQL validation (SQLGlot), and sandboxed query execution.</li>
          <li>Optimized Azure OpenAI API latency and token consumption by <strong>35%</strong> through prompt caching and semantic chunk retrieval via Azure AI Search.</li>
          <li>Implemented deterministic circuit breakers, recursion limits, and state validation guardrails to prevent non-deterministic agent loops.</li>
          <li>Engineered automated LLM evaluation pipelines using Ragas measuring context recall and answer faithfulness.</li>
        </ul>

        <h2>Verified Open-Source Repositories (GitHub: KesavaAI)</h2>
        <ul>
          <li>
            <span class="proj-title">modus-ai-intelligence-graph</span><span class="proj-stack">[Python, LangGraph, Multi-Agent Systems]</span>
            <br>Multi-agent state machine graph engine engineered with LangGraph for complex task planning, state persistence, and distributed tool execution.
          </li>
          <li>
            <span class="proj-title">VecturaBI - Vector Search & Analytics</span><span class="proj-stack">[FastAPI, Vector DBs, Hybrid Search, SQL]</span>
            <br>Conversational BI analytics and semantic retrieval system using vector databases and hybrid search for instant business data intelligence.
          </li>
          <li>
            <span class="proj-title">rag-azure-nasa</span><span class="proj-stack">[Azure OpenAI, Azure AI Search, Ragas]</span>
            <br>Production-grade RAG pipeline integrating Azure OpenAI and Azure AI Search with reciprocal rank fusion (RRF) and automated Ragas evaluation.
          </li>
          <li>
            <span class="proj-title">End-to-End AI Voice Assistance</span><span class="proj-stack">[Python, FastAPI, WebSockets, LLM Streaming]</span>
            <br>Real-time conversational voice and speech-to-text LLM streaming pipeline built with Python and FastAPI async websockets.
          </li>
        </ul>

        <h2>Education</h2>
        <div class="exp-header">
          <span>Bachelor of Technology (B.Tech) in Computer Science & Engineering</span>
          <span>First Class with Distinction</span>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Display Layout:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('recruiter')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'recruiter'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👔 Recruiter Visual Format
            </button>
            <button
              onClick={() => setViewMode('ats')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                viewMode === 'ats'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🤖 ATS Clean Text (100% Parser Friendly)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            ATS Score: {atsScore}%
          </span>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download ATS PDF</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: RECRUITER VISUAL LAYOUT */}
      {viewMode === 'recruiter' && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200 space-y-6 max-h-[540px] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-700 pb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                CHENNA KESAVA REDDY BHOMIREDDY GARI
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/30 uppercase">
                  {targetRole}
                </span>
                <span className="text-xs text-slate-400">• Tailored for {targetCompany}</span>
              </div>
            </div>
            <div className="text-right text-xs space-y-1 text-slate-300">
              <div className="flex items-center md:justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Bengaluru, India</span>
              </div>
              <div className="flex items-center md:justify-end gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href="mailto:kesavac913@gmail.com" className="hover:text-emerald-400">kesavac913@gmail.com</a>
              </div>
              <div className="flex items-center md:justify-end gap-3 font-semibold text-emerald-400">
                <a href="https://github.com/KesavaAI" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  <span>github.com/KesavaAI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a href="https://www.linkedin.com/in/chenna00/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  <span>linkedin.com/in/chenna00</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 1: Professional Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Professional Summary</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              GenAI & Agentic AI Engineer with <strong className="text-slate-100">~1.6 years of verified production experience at Tata Consultancy Services (TCS)</strong> architecting enterprise autonomous multi-agent systems, LangGraph workflows, RAG pipelines, and high-performance FastAPI microservices. Specialized in deterministic agent execution, AST SQL validation, and Azure OpenAI cloud architectures. Specifically tailored for <strong className="text-emerald-400">{targetRole}</strong> at <strong className="text-emerald-400">{targetCompany}</strong>.
            </p>
          </div>

          {/* Section 2: Core Technical Skills */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Core Technical Skills</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">GenAI & Agentic Frameworks</p>
                <p className="text-slate-400 text-[11px]">LangGraph, LangChain, Multi-Agent Orchestration, Prompt Engineering, Structured Outputs, Function Calling, Circuit Breakers</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">RAG & Vector Retrieval</p>
                <p className="text-slate-400 text-[11px]">Hybrid Search (BM25 + Dense Vectors), Azure AI Search, ChromaDB, Qdrant, Reciprocal Rank Fusion, Cross-Encoder Reranking</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">Languages & Backend Infrastructure</p>
                <p className="text-slate-400 text-[11px]">Python (AsyncIO, Concurrency), FastAPI, SQL, PostgreSQL, REST APIs, Docker, CI/CD, Git</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="font-bold text-slate-200 mb-1">Cloud, AI Platforms & Evaluation</p>
                <p className="text-slate-400 text-[11px]">Azure, Azure OpenAI (GPT-4o), Azure AI Studio, Ragas Benchmark, TruLens, AST Validation (SQLGlot)</p>
              </div>
            </div>
          </div>

          {/* Section 3: Production Experience */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Production Work Experience</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">Tata Consultancy Services (TCS)</h3>
                  <p className="text-xs font-semibold text-emerald-400">{targetRole} • Production Engineering</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-medium">
                  <span>Oct 2024 – Present | Bengaluru, India</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-outside pl-4 leading-relaxed">
                <li>Architected and engineered the <strong className="text-slate-100">TCS Agentic Data Intelligence</strong> platform, enabling enterprise conversational data analytics across relational databases with <strong className="text-emerald-400 font-mono font-bold">94.2% query accuracy</strong> (reduced turnaround from 4 days to 8 seconds).</li>
                <li>Designed a stateful multi-agent LangGraph workflow incorporating schema pruning, iterative planning, AST SQL validation (SQLGlot), and sandboxed query execution.</li>
                <li>Optimized Azure OpenAI API latency and token consumption by <strong className="text-emerald-400 font-mono font-bold">35%</strong> through prompt caching and semantic chunk retrieval via Azure AI Search.</li>
                <li>Implemented deterministic circuit breakers, recursion limits, and state validation guardrails to prevent non-deterministic agent loops.</li>
                <li>Engineered automated LLM evaluation pipelines using Ragas measuring context recall and answer faithfulness.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Verified Open Source Projects */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Open-Source Repositories (GitHub: KesavaAI)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">modus-ai-intelligence-graph</h4>
                  <a href="https://github.com/KesavaAI/modus-ai-intelligence-graph" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">Python, LangGraph, Multi-Agent Systems</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">Multi-agent state machine graph engine engineered with LangGraph for complex task planning, state persistence, and distributed tool execution.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">VecturaBI - Vector Search & Analytics</h4>
                  <a href="https://github.com/KesavaAI/VecturaBI" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">FastAPI, Vector DBs, Hybrid Search, SQL</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">Conversational BI analytics and semantic retrieval system using vector databases and hybrid search for instant business data intelligence.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">rag-azure-nasa</h4>
                  <a href="https://github.com/KesavaAI/rag-azure-nasa" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">Azure OpenAI, Azure AI Search, Ragas</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">Production-grade RAG pipeline integrating Azure OpenAI and Azure AI Search with reciprocal rank fusion (RRF) and automated Ragas evaluation.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100">End-to-End AI Voice Assistance</h4>
                  <a href="https://github.com/KesavaAI/End-to-End-AI-Voice-Assistance-Pipeline" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">Python, FastAPI, WebSockets, LLM Streaming</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">Real-time conversational voice and speech-to-text LLM streaming pipeline built with Python and FastAPI async websockets.</p>
              </div>
            </div>
          </div>

          {/* Section 5: Education */}
          <div className="space-y-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </h2>
            <div className="text-xs py-1">
              <p className="font-bold text-slate-200">Bachelor of Technology (B.Tech) in Computer Science & Engineering</p>
              <p className="text-[11px] text-slate-400">First Class with Distinction</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ATS CLEAN TEXT / MARKDOWN */}
      {viewMode === 'ats' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ATS Compliance Verified: 100% Single-column, standard headings, zero tables/unsupported glyphs. Ideal for Workday, Lever, Greenhouse.</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {markdown}
          </div>
        </div>
      )}
    </div>
  );
};
