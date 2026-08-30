import React, { useState, useEffect } from 'react';
import { Briefcase, ShieldCheck, CheckCircle2, ExternalLink, GitBranch, Cpu, Database, Award, Github, Sparkles, FolderGit2, Plus, Code, Globe, Layers } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';

export const ProjectsView: React.FC = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newCategory, setNewCategory] = useState('AGENTIC_AI');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newLiveUrl, setNewLiveUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      const allProj = await api.getProjects();
      setProjects(allProj);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createProject({
        title: newTitle,
        category: newCategory,
        description: newDesc,
        technologies: newTech,
        metrics: 'Engineered for high throughput and reliability',
        learnings: 'Applied modern system architecture best practices',
        is_featured: false
      });
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewTech('');
      await loadProjects();
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const githubUser = profile?.social_links?.github
    ? profile.social_links.github.replace('https://github.com/', '').replace('/', '')
    : user?.full_name?.split(' ')[0]?.toLowerCase() || 'candidate';

  const flagshipProject = projects.find(p => p.is_featured) || projects[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>Candidate Project Showcase & Architecture Lab</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production system architectures, live prototypes, and open-source contributions for <strong className="text-emerald-400">{user?.full_name || 'Candidate'}</strong> ({user?.target_role || 'Tech Role'}).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {profile?.social_links?.github && (
            <a
              href={profile.social_links.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              <Github className="w-4 h-4 text-emerald-400" />
              <span>@{githubUser}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {/* HERO FEATURED FLAGSHIP ARCHITECTURE */}
      {flagshipProject && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] tracking-wider border border-emerald-500/30 uppercase">
                  ⭐ FLAGSHIP SHOWCASE
                </span>
                <span className="text-xs text-slate-400">• {flagshipProject.category}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-100 tracking-tight mt-1">
                {flagshipProject.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-slate-950 px-3 py-1 rounded-lg border border-emerald-500/30">
                {flagshipProject.metrics || 'High Performance Architecture'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {flagshipProject.description}
          </p>

          {/* Architecture Flow Diagram */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SYSTEM ARCHITECTURE PIPELINE
            </span>
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-nowrap leading-relaxed">
              CLIENT / API ➔ INGESTION & VALIDATION LAYER ➔ CORE REASONING & WORKFLOW ENGINE ➔ DETERMINISTIC GUARDRAILS ➔ DATABASE / VECTOR STORE ➔ SYNTHESIS & METRICS
            </div>
          </div>

          {/* Key Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-extrabold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Technologies</span>
              </h4>
              <p className="text-slate-400 text-[11px]">{flagshipProject.technologies}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-extrabold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Guardrails & Safety</span>
              </h4>
              <p className="text-slate-400 text-[11px]">Strict schema validation, error boundaries, and rate limiting preventing execution degradation.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="font-extrabold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Evaluation & Scaling</span>
              </h4>
              <p className="text-slate-400 text-[11px]">Benchmarked for low latency and high availability under peak concurrency loads.</p>
            </div>
          </div>
        </div>
      )}

      {/* ALL CANDIDATE REPOSITORIES & PROJECTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>Verified Projects & Systems Portfolio</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">{projects.length} Total Projects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase border border-blue-500/30">
                    {p.category}
                  </span>
                  <span className="text-emerald-400/90 font-mono text-[10px] font-bold">
                    {p.metrics || 'Verified Project'}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="font-extrabold text-sm text-slate-100">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">{p.description}</p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono truncate max-w-[280px]">
                  <strong className="text-slate-400">Tech:</strong> {p.technologies}
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Add New Project to Portfolio</h3>
              <p className="text-xs text-slate-400">Showcase your architecture, technologies, and metrics to recruiters.</p>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Orchestrator with FastAPI & Redis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="AGENTIC_AI">🤖 GenAI / Agentic AI</option>
                    <option value="BACKEND">⚡ Backend & Microservices</option>
                    <option value="FULLSTACK">💻 Full Stack App</option>
                    <option value="ML_DATA">📊 Machine Learning / Data</option>
                    <option value="DEV_TOOL">🛠️ Developer Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Technologies (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    placeholder="Python, FastAPI, Redis, Docker"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Explain what the system does, architectural decisions, and performance outcomes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving Project...' : 'Save to My Portfolio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
