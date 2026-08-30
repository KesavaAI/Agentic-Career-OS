import React, { useState, useEffect } from 'react';
import {
  User, Briefcase, GraduationCap, Code2, Award, Sparkles, Plus, Trash2,
  ExternalLink, Save, CheckCircle2, AlertCircle, ArrowUpRight, Zap, Target,
  FileText, Link2, Building, Calendar, MapPin, Layers, Wrench, ShieldCheck,
  Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, checkPasswordStrength, isValidPasswordStrict } from '../../lib/api';

export const ProfileView: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'goals' | 'experience' | 'academics' | 'projects' | 'skills' | 'certifications' | 'security'>('goals');
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security & Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passValidation = isValidPasswordStrict(newPass);
    if (!passValidation.valid) {
      setPassError(passValidation.error || 'New password does not meet complexity requirements.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match. Please verify.');
      return;
    }
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPass
      });
      setPassSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setPassSuccess(''), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Please verify current password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Modals
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isInternModalOpen, setIsInternModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // AI Bullet Enhancer State
  const [roughBullet, setRoughBullet] = useState('');
  const [enhancingBullet, setEnhancingBullet] = useState(false);
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<string[]>([]);

  // Item Form States
  const [newExp, setNewExp] = useState({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
    bullets: [''],
    tech_stack: ''
  });

  const [newIntern, setNewIntern] = useState({
    company: '',
    role: '',
    duration: '',
    deliverables: '',
    mentor_notes: ''
  });

  const [newEdu, setNewEdu] = useState({
    degree: '',
    institution: '',
    major: '',
    graduation_year: '',
    cgpa_percentage: ''
  });

  const [newProj, setNewProj] = useState({
    title: '',
    description: '',
    tech_stack: '',
    github_url: '',
    live_url: '',
    metrics: ''
  });

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    credential_id: '',
    credential_url: ''
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'languages' | 'frameworks' | 'cloud_db' | 'aiml' | 'tools'>('languages');

  useEffect(() => {
    if (profile) {
      setFormData(JSON.parse(JSON.stringify(profile)));
    }
  }, [profile]);

  if (!formData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading your candidate profile...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceBullet = async () => {
    if (!roughBullet.trim()) return;
    setEnhancingBullet(true);
    try {
      const res = await api.enhanceBullet({
        rough_text: roughBullet,
        target_role: formData.target_role,
        tech_stack: newExp.tech_stack || 'Python, FastAPI, SQL'
      });
      if (res && res.enhanced_bullets) {
        setEnhancedSuggestions(res.enhanced_bullets);
      }
    } catch (err) {
      console.error('Failed to enhance bullet:', err);
    } finally {
      setEnhancingBullet(false);
    }
  };

  const addExperience = () => {
    const stackArr = newExp.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
    const expItem = {
      ...newExp,
      tech_stack: stackArr,
      bullets: newExp.bullets.filter(b => b.trim())
    };
    const updated = {
      ...formData,
      experiences: [...(formData.experiences || []), expItem]
    };
    setFormData(updated);
    setIsExpModalOpen(false);
    setNewExp({
      company: '',
      role: '',
      start_date: '',
      end_date: '',
      is_current: false,
      location: '',
      bullets: [''],
      tech_stack: ''
    });
    setEnhancedSuggestions([]);
    setRoughBullet('');
  };

  const addInternship = () => {
    const updated = {
      ...formData,
      internships: [...(formData.internships || []), newIntern]
    };
    setFormData(updated);
    setIsInternModalOpen(false);
    setNewIntern({ company: '', role: '', duration: '', deliverables: '', mentor_notes: '' });
  };

  const addEducation = () => {
    const updated = {
      ...formData,
      education: [...(formData.education || []), newEdu]
    };
    setFormData(updated);
    setIsEduModalOpen(false);
    setNewEdu({ degree: '', institution: '', major: '', graduation_year: '', cgpa_percentage: '' });
  };

  const addProject = () => {
    const stackArr = newProj.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
    const projItem = { ...newProj, tech_stack: stackArr };
    const updated = {
      ...formData,
      projects: [...(formData.projects || []), projItem]
    };
    setFormData(updated);
    setIsProjModalOpen(false);
    setNewProj({ title: '', description: '', tech_stack: '', github_url: '', live_url: '', metrics: '' });
  };

  const addCertification = () => {
    const updated = {
      ...formData,
      certifications: [...(formData.certifications || []), newCert]
    };
    setFormData(updated);
    setIsCertModalOpen(false);
    setNewCert({ title: '', issuer: '', issue_date: '', credential_id: '', credential_url: '' });
  };

  const addSkillChip = () => {
    if (!newSkillInput.trim()) return;
    const cat = selectedSkillCategory;
    const currentList = formData.skills?.[cat] || [];
    if (!currentList.includes(newSkillInput.trim())) {
      const updated = {
        ...formData,
        skills: {
          ...formData.skills,
          [cat]: [...currentList, newSkillInput.trim()]
        }
      };
      setFormData(updated);
    }
    setNewSkillInput('');
  };

  const removeSkillChip = (category: string, skill: string) => {
    const currentList = formData.skills?.[category] || [];
    const updated = {
      ...formData,
      skills: {
        ...formData.skills,
        [category]: currentList.filter((s: string) => s !== skill)
      }
    };
    setFormData(updated);
  };

  // Calculate Profile Completeness
  const calculateCompleteness = () => {
    let score = 30; // base for registration
    if (formData.bio && formData.bio.length > 20) score += 15;
    if (formData.experiences && formData.experiences.length > 0) score += 15;
    if (formData.internships && formData.internships.length > 0) score += 10;
    if (formData.education && formData.education.length > 0) score += 10;
    if (formData.skills && Object.values(formData.skills).some((arr: any) => arr?.length > 0)) score += 10;
    if (formData.certifications && formData.certifications.length > 0) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
              Universal Candidate Profile
            </span>
            <span className="text-slate-400 text-xs">• Tailored to your career pool</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1.5 flex items-center gap-2">
            <span>{formData.full_name || 'Candidate Profile'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Dream Package: ₹{formData.target_min_ctc_lpa || '18'}+ LPA
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            This profile fuels your automated <strong className="text-emerald-300 font-semibold">ATS Resume Generator</strong>, <strong className="text-blue-300 font-semibold">1-Click Recruiter Outreach</strong>, and <strong className="text-purple-300 font-semibold">Dynamic AI Mock Interview Room</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile Strength */}
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Profile Strength</div>
            <div className="text-sm font-extrabold text-emerald-400">{completeness}% Complete</div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved Changes!' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {[
          { id: 'goals', label: '👤 Career Target & Bio', icon: Target },
          { id: 'experience', label: `💼 Work Experience (${formData.experiences?.length || 0})`, icon: Briefcase },
          { id: 'academics', label: `🎓 Internships & Education (${(formData.internships?.length || 0) + (formData.education?.length || 0)})`, icon: GraduationCap },
          { id: 'projects', label: `💻 Projects (${formData.projects?.length || 0})`, icon: Code2 },
          { id: 'skills', label: '⚡ Skills Matrix', icon: Zap },
          { id: 'certifications', label: `📜 Certifications (${formData.certifications?.length || 0})`, icon: Award },
          { id: 'security', label: '🔒 Password & Security', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: 👤 CAREER TARGET & BIO */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Personal Details & Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Location / Base City</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold text-xs">Executive Summary / Professional Bio</label>
              <textarea
                rows={4}
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief summary of your technical engineering background, flagship project achievements, and what you are looking for..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 🔗 Professional Links & Websites */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <span>Online Profiles & Websites</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                    <span>GitHub Profile URL</span>
                    {formData.social_links?.github && (
                      <a href={formData.social_links.github} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[10px]">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourusername"
                    value={formData.social_links?.github || formData.github_url || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        github_url: val,
                        social_links: { ...(formData.social_links || {}), github: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                    <span>LinkedIn Profile URL</span>
                    {formData.social_links?.linkedin && (
                      <a href={formData.social_links.linkedin} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[10px]">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.social_links?.linkedin || formData.linkedin_url || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        linkedin_url: val,
                        social_links: { ...(formData.social_links || {}), linkedin: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                    <span>Portfolio / Personal Website</span>
                    {formData.social_links?.portfolio && (
                      <a href={formData.social_links.portfolio} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[10px]">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={formData.social_links?.portfolio || formData.portfolio_url || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        portfolio_url: val,
                        social_links: { ...(formData.social_links || {}), portfolio: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                    <span>LeetCode / HackerRank / Coding Profile</span>
                    {formData.social_links?.leetcode && (
                      <a href={formData.social_links.leetcode} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[10px]">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/yourhandle"
                    value={formData.social_links?.leetcode || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        social_links: { ...(formData.social_links || {}), leetcode: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                    <span>Other Website / Tech Blog / Research Papers</span>
                    {formData.social_links?.other && (
                      <a href={formData.social_links.other} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[10px]">
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://medium.com/@yourblog or https://kaggle.com/yourprofile"
                    value={formData.social_links?.other || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        social_links: { ...(formData.social_links || {}), other: val }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Target Parameters & Candidate Pool */}
          <div className="space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Target Career Parameters</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Candidate Pool</label>
                <select
                  value={formData.candidate_pool || 'SERVICE_SWITCHER'}
                  onChange={e => setFormData({ ...formData, candidate_pool: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="SERVICE_SWITCHER">🚀 Service-to-Product Transitioner (e.g. TCS, Infosys ➔ Product)</option>
                  <option value="FRESHER">🎓 College Fresher / Intern (0 YOE)</option>
                  <option value="EXPERIENCED">👨‍💼 Mid-Senior Engineer (3+ YOE)</option>
                  <option value="DOMAIN_SWITCHER">🔄 Domain Switcher (Self-Taught / Career Transition)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Primary Target Role</label>
                <input
                  type="text"
                  value={formData.target_role || ''}
                  onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                  placeholder="e.g. GenAI / Agentic AI Engineer, Backend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Current CTC</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.current_ctc_lpa || ''}
                    onChange={e => setFormData({ ...formData, current_ctc_lpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">₹ LPA</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Dream Package (₹ LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.target_min_ctc_lpa || ''}
                    onChange={e => setFormData({ ...formData, target_min_ctc_lpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-bold text-emerald-400"
                  />
                  <span className="text-[10px] text-emerald-500 font-semibold">Aspirational Goal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Total Experience</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.experience_years || ''}
                    onChange={e => setFormData({ ...formData, experience_years: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">Years</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Notice Period</label>
                  <input
                    type="number"
                    value={formData.notice_period_days || 30}
                    onChange={e => setFormData({ ...formData, notice_period_days: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 💼 WORK EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Work Experience & Employment History</h3>
              <p className="text-xs text-slate-400">Add past and current roles. AI will format your achievements into high-impact ATS bullets.</p>
            </div>
            <button
              onClick={() => setIsExpModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.experiences && formData.experiences.length > 0 ? (
              formData.experiences.map((exp: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 relative group">
                  <button
                    onClick={() => {
                      const updated = {
                        ...formData,
                        experiences: formData.experiences.filter((_: any, i: number) => i !== idx)
                      };
                      setFormData(updated);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-100">{exp.role}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-300">{exp.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</span>
                          {exp.location && <span>• {exp.location}</span>}
                        </div>
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                          {exp.bullets.map((bullet: string, bIdx: number) => (
                            <li key={bIdx} className="leading-relaxed">{bullet}</li>
                          ))}
                        </ul>
                      )}

                      {exp.tech_stack && exp.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {exp.tech_stack.map((t: string, tIdx: number) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold">No work experience added yet.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click "+ Add Experience" above to highlight your employment history.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 🎓 INTERNSHIPS & ACADEMICS */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Internships Sub-section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">Internships & Traineeships</h3>
                <p className="text-[11px] text-slate-400">Vital for college graduates & early-career talent.</p>
              </div>
              <button
                onClick={() => setIsInternModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Internship</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.internships && formData.internships.length > 0 ? (
                formData.internships.map((intern: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 relative group text-xs space-y-1.5">
                    <button
                      onClick={() => {
                        const updated = {
                          ...formData,
                          internships: formData.internships.filter((_: any, i: number) => i !== idx)
                        };
                        setFormData(updated);
                      }}
                      className="absolute top-3 right-3 p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <h4 className="font-bold text-slate-100">{intern.role}</h4>
                    <p className="text-cyan-400 font-medium">{intern.company} • {intern.duration}</p>
                    <p className="text-slate-300">{intern.deliverables}</p>
                    {intern.mentor_notes && <p className="text-[11px] text-slate-500 italic">"{intern.mentor_notes}"</p>}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No internships recorded.
                </div>
              )}
            </div>
          </div>

          {/* Education Sub-section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">Education & Degrees</h3>
                <p className="text-[11px] text-slate-400">Undergraduate & postgraduate qualifications.</p>
              </div>
              <button
                onClick={() => setIsEduModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.education && formData.education.length > 0 ? (
                formData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 relative group text-xs space-y-1">
                    <button
                      onClick={() => {
                        const updated = {
                          ...formData,
                          education: formData.education.filter((_: any, i: number) => i !== idx)
                        };
                        setFormData(updated);
                      }}
                      className="absolute top-3 right-3 p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <h4 className="font-bold text-slate-100">{edu.degree}</h4>
                    <p className="text-teal-400">{edu.institution} ({edu.graduation_year})</p>
                    <p className="text-slate-400">Score / CGPA: <strong className="text-slate-200">{edu.cgpa_percentage}</strong></p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No education records added.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 💻 PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Flagship Projects & Technical Portfolio</h3>
              <p className="text-xs text-slate-400">Showcase your architecture, live demos, and quantitative impact.</p>
            </div>
            <button
              onClick={() => setIsProjModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.projects && formData.projects.length > 0 ? (
              formData.projects.map((proj: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 relative group space-y-3">
                  <button
                    onClick={() => {
                      const updated = {
                        ...formData,
                        projects: formData.projects.filter((_: any, i: number) => i !== idx)
                      };
                      setFormData(updated);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-100">{proj.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{proj.description}</p>
                  </div>

                  {proj.metrics && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium">
                      🎯 Metric: {proj.metrics}
                    </div>
                  )}

                  {proj.tech_stack && (
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(proj.tech_stack) ? proj.tech_stack : [proj.tech_stack]).map((t: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-purple-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 underline">
                        <span>GitHub Repo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {proj.live_url && (
                      <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline">
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No portfolio projects added yet. Click "+ Add Project" to build your portfolio.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ⚡ SKILLS MATRIX */}
      {activeTab === 'skills' && (
        <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Technical Skills & Competency Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">Categorize your proficiencies so the ATS Resume Tailorer matches JD requirements.</p>
            </div>

            {/* Add Skill Bar */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedSkillCategory}
                onChange={e => setSelectedSkillCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="languages">Languages</option>
                <option value="frameworks">Frameworks</option>
                <option value="cloud_db">Cloud & Databases</option>
                <option value="aiml">AI / ML & GenAI</option>
                <option value="tools">Tools & Methods</option>
              </select>

              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkillChip()}
                placeholder="Skill name (e.g. LangGraph)..."
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={addSkillChip}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: 'languages', label: '🐍 Programming Languages', color: 'border-emerald-500/30 text-emerald-400' },
              { key: 'frameworks', label: '⚛️ Frameworks & Libraries', color: 'border-cyan-500/30 text-cyan-400' },
              { key: 'cloud_db', label: '☁️ Cloud, Databases & DevOps', color: 'border-blue-500/30 text-blue-400' },
              { key: 'aiml', label: '🧠 AI / ML, GenAI & Agents', color: 'border-purple-500/30 text-purple-400' },
              { key: 'tools', label: '🛠️ Tools, Testing & Methodologies', color: 'border-amber-500/30 text-amber-400' }
            ].map(cat => (
              <div key={cat.key} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300">{cat.label}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills?.[cat.key] && formData.skills[cat.key].length > 0 ? (
                    formData.skills[cat.key].map((s: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border ${cat.color} text-xs font-mono`}
                      >
                        <span>{s}</span>
                        <button
                          onClick={() => removeSkillChip(cat.key, s)}
                          className="text-slate-500 hover:text-red-400 text-xs font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No skills listed in this category.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: 📜 CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Certifications & Industry Credentials</h3>
              <p className="text-xs text-slate-400">Verified credentials from AWS, Microsoft, Google, Meta, Stanford, etc.</p>
            </div>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.certifications && formData.certifications.length > 0 ? (
              formData.certifications.map((cert: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 relative group space-y-2 text-xs">
                  <button
                    onClick={() => {
                      const updated = {
                        ...formData,
                        certifications: formData.certifications.filter((_: any, i: number) => i !== idx)
                      };
                      setFormData(updated);
                    }}
                    className="absolute top-3 right-3 p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-2 w-fit rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{cert.title}</h4>
                    <p className="text-teal-400 font-medium">{cert.issuer} • {cert.issue_date}</p>
                    {cert.credential_id && <p className="text-slate-400 text-[10px] font-mono mt-0.5">ID: {cert.credential_id}</p>}
                  </div>
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 underline text-[11px]">
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No certifications added yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: 🔒 PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-xl mx-auto space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">Security & Password Management</h3>
              <p className="text-[11px] text-slate-400">Update your account credentials to keep your candidate profile protected.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            {passError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}
            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Current Password <span className="text-red-400 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  New Password <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">
                  Confirm New Password <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    value={confirmNewPass}
                    onChange={e => setConfirmNewPass(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 🛡️ PASSWORD STRENGTH METER & CHECKLIST */}
            {newPass && (() => {
              const strength = checkPasswordStrength(newPass);
              return (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Security Strength:</span>
                    <span className={`font-bold font-mono ${strength.textColor}`}>{strength.label}</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${Math.min(100, (strength.score / 4) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
                    <div className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasMinLength ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasLower && strength.hasUpper ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasLower && strength.hasUpper ? '✓' : '○'}</span>
                      <span>Upper & Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasNumber ? '✓' : '○'}</span>
                      <span>At least 1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${strength.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      <span>{strength.hasSpecial ? '✓' : '○'}</span>
                      <span>Special symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2">
              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {passLoading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Work Experience with AI Bullet Enhancer */}
      {isExpModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Add Work Experience</span>
              </h3>
              <button onClick={() => setIsExpModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={newExp.company}
                    onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Job Title / Role</label>
                  <input
                    type="text"
                    value={newExp.role}
                    onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                    placeholder="e.g. GenAI Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
                  <input
                    type="text"
                    value={newExp.start_date}
                    onChange={e => setNewExp({ ...newExp, start_date: e.target.value })}
                    placeholder="e.g. Nov 2024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">End Date (or Present)</label>
                  <input
                    type="text"
                    value={newExp.is_current ? 'Present' : newExp.end_date}
                    onChange={e => setNewExp({ ...newExp, end_date: e.target.value })}
                    placeholder="e.g. Present"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newExp.tech_stack}
                  onChange={e => setNewExp({ ...newExp, tech_stack: e.target.value })}
                  placeholder="e.g. Python, LangGraph, FastAPI, Azure OpenAI, PostgreSQL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              {/* ⚡ AI Bullet Point Enhancer */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Resume Bullet Enhancer (STAR Method)</span>
                  </span>
                  <button
                    onClick={handleEnhanceBullet}
                    disabled={enhancingBullet || !roughBullet.trim()}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {enhancingBullet ? 'Generating...' : 'Enhance with AI'}
                  </button>
                </div>
                <input
                  type="text"
                  value={roughBullet}
                  onChange={e => setRoughBullet(e.target.value)}
                  placeholder="Type rough note (e.g. built multi agent system with langgraph to query sql)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />

                {enhancedSuggestions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Click any suggestion to add to bullets:</span>
                    {enhancedSuggestions.map((sug, sIdx) => (
                      <div
                        key={sIdx}
                        onClick={() => {
                          setNewExp({ ...newExp, bullets: [...newExp.bullets.filter(Boolean), sug] });
                          setEnhancedSuggestions(enhancedSuggestions.filter((_, i) => i !== sIdx));
                        }}
                        className="p-2 rounded bg-slate-900 border border-purple-500/30 text-[11px] text-purple-200 hover:bg-purple-900/30 cursor-pointer transition-colors"
                      >
                        + {sug}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Bullet Points</label>
                {newExp.bullets.map((bullet, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={bullet}
                    onChange={e => {
                      const updated = [...newExp.bullets];
                      updated[idx] = e.target.value;
                      setNewExp({ ...newExp, bullets: updated });
                    }}
                    placeholder={`Bullet #${idx + 1}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewExp({ ...newExp, bullets: [...newExp.bullets, ''] })}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  + Add another bullet line
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsExpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addExperience}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Internship */}
      {isInternModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Add Internship</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Company / Organization</label>
                <input
                  type="text"
                  value={newIntern.company}
                  onChange={e => setNewIntern({ ...newIntern, company: e.target.value })}
                  placeholder="e.g. SmartBridge / Microsoft"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Intern Role</label>
                <input
                  type="text"
                  value={newIntern.role}
                  onChange={e => setNewIntern({ ...newIntern, role: e.target.value })}
                  placeholder="e.g. AI / ML Developer Intern"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Duration</label>
                <input
                  type="text"
                  value={newIntern.duration}
                  onChange={e => setNewIntern({ ...newIntern, duration: e.target.value })}
                  placeholder="e.g. 6 Months (Jan 2026 - Jun 2026)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Key Deliverables & Responsibilities</label>
                <textarea
                  rows={3}
                  value={newIntern.deliverables}
                  onChange={e => setNewIntern({ ...newIntern, deliverables: e.target.value })}
                  placeholder="What did you build or achieve during this internship?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsInternModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button onClick={addInternship} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">Save Internship</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Education */}
      {isEduModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>Add Education Degree</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Degree Title</label>
                <input
                  type="text"
                  value={newEdu.degree}
                  onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science & Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Institution / College</label>
                <input
                  type="text"
                  value={newEdu.institution}
                  onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })}
                  placeholder="e.g. National Institute of Technology"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Graduation Year</label>
                  <input
                    type="text"
                    value={newEdu.graduation_year}
                    onChange={e => setNewEdu({ ...newEdu, graduation_year: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">CGPA / Score</label>
                  <input
                    type="text"
                    value={newEdu.cgpa_percentage}
                    onChange={e => setNewEdu({ ...newEdu, cgpa_percentage: e.target.value })}
                    placeholder="e.g. 8.6 / 10.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsEduModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button onClick={addEducation} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold">Save Education</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Project */}
      {isProjModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Add Technical Project</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Project Title</label>
                <input
                  type="text"
                  value={newProj.title}
                  onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                  placeholder="e.g. Enterprise RAG Multi-Agent Pipeline"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description & Architecture</label>
                <textarea
                  rows={3}
                  value={newProj.description}
                  onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                  placeholder="Explain the problem statement and technical architecture..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newProj.tech_stack}
                  onChange={e => setNewProj({ ...newProj, tech_stack: e.target.value })}
                  placeholder="e.g. Python, LangGraph, Qdrant, FastAPI, Docker"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">GitHub URL</label>
                  <input
                    type="text"
                    value={newProj.github_url}
                    onChange={e => setNewProj({ ...newProj, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Live Demo URL</label>
                  <input
                    type="text"
                    value={newProj.live_url}
                    onChange={e => setNewProj({ ...newProj, live_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Quantitative Impact / Benchmark</label>
                <input
                  type="text"
                  value={newProj.metrics}
                  onChange={e => setNewProj({ ...newProj, metrics: e.target.value })}
                  placeholder="e.g. Automated data processing from 4 days to 8 seconds; 94% AST SQL accuracy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsProjModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button onClick={addProject} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">Save Project</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Certification */}
      {isCertModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-400" />
              <span>Add Certification</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Certificate Name</label>
                <input
                  type="text"
                  value={newCert.title}
                  onChange={e => setNewCert({ ...newCert, title: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Issuing Organization</label>
                <input
                  type="text"
                  value={newCert.issuer}
                  onChange={e => setNewCert({ ...newCert, issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services / Microsoft / Google"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Issue Year / Date</label>
                  <input
                    type="text"
                    value={newCert.issue_date}
                    onChange={e => setNewCert({ ...newCert, issue_date: e.target.value })}
                    placeholder="e.g. 2025"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Credential ID</label>
                  <input
                    type="text"
                    value={newCert.credential_id}
                    onChange={e => setNewCert({ ...newCert, credential_id: e.target.value })}
                    placeholder="e.g. AWS-SAA-9821"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Verification URL</label>
                <input
                  type="text"
                  value={newCert.credential_url}
                  onChange={e => setNewCert({ ...newCert, credential_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setIsCertModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">Cancel</button>
              <button onClick={addCertification} className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold">Save Certificate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
