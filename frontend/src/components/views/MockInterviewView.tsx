import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Flame, Mic, MicOff, Volume2, VolumeX, Send, RefreshCw,
  Award, CheckCircle2, AlertTriangle, ShieldCheck, Play, Square, Radio
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const MockInterviewView: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.target_role || 'Software Engineer';
  const [mode, setMode] = useState(currentRole);
  const [pressureMode, setPressureMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [speechLang, setSpeechLang] = useState('en-IN'); // en-IN default for Indian English accuracy
  const [handsFree, setHandsFree] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'interviewer',
      content: `Hello! Welcome to your technical interview for the ${currentRole} role. I'm glad to connect with you today. To kick things off, could you please introduce yourself and give me a brief overview of your background, technical skills, and key projects?`
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionEvaluation, setSessionEvaluation] = useState<any | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isSubmittingRef = useRef(false);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;

        recognition.onresult = (event: any) => {
          if (isSubmittingRef.current) return;
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          if (fullTranscript.trim()) {
            setUserInput(fullTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [speechLang]);

  // Speak AI message aloud with Male or Female Voice Selection
  const speakMessage = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;

    stopSpeaking();

    // Clean text of markdown asterisks/formatting before speaking
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;

    const voices = synthRef.current.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    if (voiceGender === 'female') {
      utterance.pitch = 1.15;
      const femaleVoice = englishVoices.find(v =>
        v.name.includes('Zira') ||
        v.name.includes('Samantha') ||
        v.name.includes('Jenny') ||
        v.name.includes('Aria') ||
        v.name.includes('Female') ||
        v.name.includes('Victoria')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    } else {
      utterance.pitch = 0.92;
      const maleVoice = englishVoices.find(v =>
        v.name.includes('David') ||
        v.name.includes('Mark') ||
        v.name.includes('Guy') ||
        v.name.includes('George') ||
        v.name.includes('Ryan') ||
        v.name.includes('Male')
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // If hands-free mode is active, automatically open mic for user answer!
      if (handsFree) {
        startListening();
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome or Edge.');
      return;
    }
    stopSpeaking();
    isSubmittingRef.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendAnswer = async () => {
    const textToSend = userInput.trim();
    if (!textToSend || loading) return;

    // Immediately stop listening, flag submitting, and clear the input box
    isSubmittingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    setUserInput('');

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.mockInterviewTurn({
        mode,
        is_pressure_mode: pressureMode,
        messages: newMessages,
        target_role: currentRole
      });

      const reply = res.interviewer_reply;
      setMessages([...newMessages, { role: 'interviewer', content: reply }]);

      // Speak interviewer's reply
      speakMessage(reply);

      if (res.is_finished) {
        setSessionEvaluation(res);
      }
    } catch (err) {
      console.error('Turn failed:', err);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleReset = () => {
    stopSpeaking();
    stopListening();
    const welcome = `Hello! Welcome to your technical interview for the ${currentRole} role ${pressureMode ? '🔥 (Pressure Mode Active)' : ''}. I'm glad to connect with you. To kick things off, could you please introduce yourself and give me a brief overview of your background, technical skills, and key projects?`;
    setMessages([
      {
        role: 'interviewer',
        content: welcome
      }
    ]);
    setSessionEvaluation(null);
    speakMessage(welcome);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>AI Mock Interview Room</span>
            </h2>
            {pressureMode && (
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase animate-pulse">
                <Flame className="w-3 h-3 fill-red-400" />
                PRESSURE MODE ON
              </span>
            )}
            {isListening && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                <Radio className="w-3 h-3" />
                LISTENING
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
                <Volume2 className="w-3 h-3" />
                AI SPEAKING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Two-way verbal technical evaluation testing depth, trade-off defense, and TCS architecture.
          </p>
        </div>

        {/* Mode & Voice Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Language / Accent Selector */}
          <select
            value={speechLang}
            onChange={(e) => {
              setSpeechLang(e.target.value);
              stopListening();
            }}
            title="Speech Recognition Model & Accent"
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="en-IN">🇮🇳 English (India)</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
          </select>

          {/* Mode Selector */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="GenAI">GenAI & LangGraph</option>
            <option value="Agentic AI">Agentic Architecture</option>
            <option value="RAG">RAG & Vector Search</option>
            <option value="Python">Python & FastAPI Async</option>
            <option value="System Design">High-Scale System Design</option>
            <option value="HR">Behavioral / HR</option>
          </select>

          {/* Voice Toggle & Male/Female Switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                if (voiceEnabled) stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {voiceEnabled && (
              <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1">
                <button
                  onClick={() => {
                    setVoiceGender('male');
                    stopSpeaking();
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    voiceGender === 'male'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  onClick={() => {
                    setVoiceGender('female');
                    stopSpeaking();
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    voiceGender === 'female'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            )}
          </div>

          {/* Hands-Free Mode Toggle */}
          <button
            onClick={() => setHandsFree(!handsFree)}
            title="Hands-Free Mode: Automatically turns on mic when AI finishes speaking"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold text-[11px] transition-all cursor-pointer ${
              handsFree
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Hands-Free {handsFree ? 'ON' : 'OFF'}</span>
          </button>

          {/* Pressure Mode Toggle */}
          <button
            onClick={() => setPressureMode(!pressureMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pressureMode
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pressure Mode</span>
          </button>

          <button
            onClick={handleReset}
            title="Reset Session"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 min-h-[420px] flex flex-col justify-between space-y-4">
        {/* Messages Feed */}
        <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  AI
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-2xl leading-relaxed relative group ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div>{m.content}</div>

                {/* Replay audio icon on AI messages */}
                {m.role !== 'user' && (
                  <button
                    onClick={() => speakMessage(m.content)}
                    title="Read Aloud"
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Interviewer is analyzing your technical response...</span>
            </div>
          )}
        </div>

        {/* Input Bar with Voice Dictation */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          {/* Mic Dictation Button */}
          <button
            onClick={toggleListening}
            title={isListening ? 'Stop Speaking (Click to Finish)' : 'Speak Your Answer (Microphone)'}
            className={`p-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40 ring-2 ring-red-400'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer()}
            placeholder={isListening ? '🎙️ Listening... Speak your technical explanation...' : 'Speak or type your technical answer here...'}
            className={`flex-1 bg-slate-950 border rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all ${
              isListening ? 'border-emerald-500 bg-emerald-950/10' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />

          <button
            onClick={handleSendAnswer}
            disabled={!userInput.trim() || loading}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Submit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Session Evaluation Card */}
      {sessionEvaluation && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Interview Session Scorecard</span>
            </h3>
            <span className="text-xl font-extrabold text-emerald-400">{sessionEvaluation.score_out_of_10}/10</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase text-[10px]">Key Strengths</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {sessionEvaluation.strengths?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 uppercase text-[10px]">Weaknesses to Improve</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {sessionEvaluation.weaknesses?.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
