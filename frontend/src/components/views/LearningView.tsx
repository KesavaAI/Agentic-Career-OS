import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, RotateCcw, AlertTriangle, Sparkles, BookOpen, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { LearningTopic } from '../../types';

export const LearningView: React.FC = () => {
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await api.getLearningTopics();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load learning topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecallCheckin = async (topicId: number, state: 'GREEN' | 'YELLOW' | 'RED') => {
    try {
      const updated = await api.recallCheckin({ topic_id: topicId, result_state: state });
      setTopics(topics.map(t => t.id === topicId ? updated : t));
    } catch (err) {
      console.error('Checkin failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <span>Skill Gap Engine & Spaced Repetition Learning (Day 0-30)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Spaced Repetition Schedule: Day 0 ➔ Day 1 ➔ Day 3 ➔ Day 7 ➔ Day 14 ➔ Day 30.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Stage 1</span>
          <p className="font-extrabold text-xs text-slate-100 mt-0.5">LEARN</p>
          <p className="text-[10px] text-slate-400">Deep conceptual grasp</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Stage 2</span>
          <p className="font-extrabold text-xs text-amber-400 mt-0.5">RECALL</p>
          <p className="text-[10px] text-slate-400">Spaced retrieval tests</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Stage 3</span>
          <p className="font-extrabold text-xs text-blue-400 mt-0.5">APPLY</p>
          <p className="text-[10px] text-slate-400">Build code & architectures</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center bg-emerald-950/20">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Stage 4</span>
          <p className="font-extrabold text-xs text-emerald-300 mt-0.5">EXPLAIN</p>
          <p className="text-[10px] text-emerald-400">Defend under pressure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                t.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300'
              }`}>
                {t.priority} Priority
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Market Demand: <strong className="text-emerald-400">{t.market_demand_pct}%</strong>
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-100">{t.skill}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                My Level: <strong className="text-slate-300">{t.my_level}</strong> • Gap: <strong className="text-slate-300">{t.gap_level}</strong>
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 text-xs flex items-center justify-between">
              <span className="text-slate-400">Spaced Schedule: <strong className="text-slate-200">Day {t.recall_schedule_day}</strong></span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                t.status === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' : (t.status === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400')
              }`}>
                {t.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Check-in:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRecallCheckin(t.id, 'GREEN')}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px]"
                >
                  GREEN (Mastered)
                </button>
                <button
                  onClick={() => handleRecallCheckin(t.id, 'YELLOW')}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px]"
                >
                  YELLOW (Weak)
                </button>
                <button
                  onClick={() => handleRecallCheckin(t.id, 'RED')}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[10px]"
                >
                  RED (Relearn)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
