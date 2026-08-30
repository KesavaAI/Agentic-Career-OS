import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  Clock, AlertTriangle, CheckCircle2, ChevronRight, RotateCcw, 
  Video, Play, Square, Pause, UserCheck, MessageSquare, StopCircle,
  Headphones, RefreshCw, User, Radio 
} from 'lucide-react';

interface QuestionItem {
  id: number;
  question: string;
  category: string;
  timeLimitSeconds: number;
}

interface VideoInterviewArenaProps {
  role: string;
  company: string;
  initialMode?: 'video' | 'voice' | 'text';
  initialInterviewerGender?: 'female' | 'male';
  onFinishSession: (sessionData: any) => void;
  onCancel: () => void;
}

export const VideoInterviewArena: React.FC<VideoInterviewArenaProps> = ({
  role,
  company,
  initialMode = 'video',
  initialInterviewerGender = 'female',
  onFinishSession,
  onCancel
}) => {
  const [interviewMode, setInterviewMode] = useState<'video' | 'voice' | 'text'>(initialMode);
  const [interviewerGender, setInterviewerGender] = useState<'female' | 'male'>(initialInterviewerGender);
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraActive, setCameraActive] = useState(initialMode === 'video');
  const [micActive, setMicActive] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [detectedFillers, setDetectedFillers] = useState<Record<string, number>>({ um: 0, like: 0, uh: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const questions: QuestionItem[] = [
    { id: 1, question: "Tell me about yourself and walk me through your technical background.", category: "Introduction", timeLimitSeconds: 120 },
    { id: 2, question: `Why are you interested in joining ${company} as a ${role}?`, category: "Motivation & Fit", timeLimitSeconds: 90 },
    { id: 3, question: "How do you optimize slow, complex queries and prevent connection pool saturation under high load?", category: "Technical Problem Solving", timeLimitSeconds: 120 },
    { id: 4, question: "Walk me through how you design high-availability error recovery and circuit breakers in production.", category: "System Architecture", timeLimitSeconds: 150 },
    { id: 5, question: "Describe a situation where you had a strong technical disagreement with a team member. How did you resolve it?", category: "Behavioral & Conflict", timeLimitSeconds: 120 },
    { id: 6, question: "Tell me about your most challenging project. What went wrong, and what was the quantifiable outcome?", category: "Flagship Project Defense", timeLimitSeconds: 180 }
  ];

  const currentQ = questions[currentQIndex];

  // AI Voice Synthesis (TTS)
  const speakQuestion = (text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = interviewerGender === 'female' ? 1.05 : 0.85;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (interviewerGender === 'female') {
        const femaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Victoria')) && v.lang.startsWith('en'));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male') || v.name.includes('Alex') || v.name.includes('George')) && v.lang.startsWith('en'));
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.onstart = () => setIsSpeakingAI(true);
    utterance.onend = () => setIsSpeakingAI(false);
    utterance.onerror = () => setIsSpeakingAI(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speak question whenever question index or voice changes
  useEffect(() => {
    speakQuestion(currentQ.question);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQIndex, interviewerGender, isAudioMuted]);

  // Setup media
  useEffect(() => {
    async function setupMedia() {
      if (interviewMode === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraActive(true);
        } catch (err) {
          console.warn("Camera access denied or unavailable:", err);
          setCameraActive(false);
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          streamRef.current = stream;
          setCameraActive(false);
        } catch {}
      }
    }

    setupMedia();

    // Setup speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => prev ? `${prev} ${transcript}` : transcript);

        const text = transcript.toLowerCase();
        const umMatches = (text.match(/\bum\b/g) || []).length;
        const likeMatches = (text.match(/\blike\b/g) || []).length;
        const uhMatches = (text.match(/\buh\b/g) || []).length;

        if (umMatches || likeMatches || uhMatches) {
          setDetectedFillers(prev => ({
            um: prev.um + umMatches,
            like: prev.like + likeMatches,
            uh: prev.uh + uhMatches
          }));
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [interviewMode]);

  // Duration Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDurationSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch {}
      }
    } else {
      setIsRecording(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    }
  };

  // ADVANCE TO NEXT QUESTION
  const handleNextQuestion = () => {
    const recordedQA = {
      question_number: currentQIndex + 1,
      question: currentQ.question,
      answer: currentAnswer.trim(),
      duration_seconds: durationSeconds || 30
    };

    const newAnswers = [...answers, recordedQA];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    setDurationSeconds(0);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setIsRecording(false);
    } else {
      // Finished all 6 questions
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();

      onFinishSession({
        role,
        company,
        questions_and_answers: newAnswers,
        total_duration_seconds: newAnswers.reduce((acc, a) => acc + (a.duration_seconds || 30), 0)
      });
    }
  };

  // STOP & EVALUATE AT ANY TIME
  const handleStopAndEvaluateNow = () => {
    const currentQA = {
      question_number: currentQIndex + 1,
      question: currentQ.question,
      answer: currentAnswer.trim(),
      duration_seconds: durationSeconds || 30
    };

    const finalAnswers = [...answers, currentQA];

    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();

    onFinishSession({
      role,
      company,
      questions_and_answers: finalAnswers,
      total_duration_seconds: finalAnswers.reduce((acc, a) => acc + (a.duration_seconds || 30), 0)
    });
  };

  const totalFillers = (detectedFillers.um || 0) + (detectedFillers.like || 0) + (detectedFillers.uh || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col justify-between max-w-7xl mx-auto space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Virtual Boardroom Simulation: {company} — {role}
            </h2>
          </div>
          <p className="text-xs text-slate-400">Dual-Presenter AI Interview Arena</p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Voice Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setInterviewerGender('female')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                interviewerGender === 'female' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👩‍💼 Sarah</span>
            </button>
            <button
              onClick={() => setInterviewerGender('male')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                interviewerGender === 'male' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👨‍💼 David</span>
            </button>
          </div>

          {/* Mute Voice */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isAudioMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            title={isAudioMuted ? "Unmute AI Voice" : "Mute AI Voice"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* End & Evaluate Early */}
          <button
            onClick={handleStopAndEvaluateNow}
            className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Interview & Evaluate</span>
          </button>

          <button 
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 🌟 PROMINENT QUESTION TELEPROMPTER BANNER */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
              Question {currentQIndex + 1} of {questions.length} • {currentQ.category}
            </span>
            {isSpeakingAI && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>AI Speaking Aloud...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => speakQuestion(currentQ.question)}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Repeat Question</span>
            </button>
            <span className="font-mono text-slate-400">Target Pacing: ~{currentQ.timeLimitSeconds}s</span>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-extrabold text-slate-100 tracking-tight leading-snug">
          "{currentQ.question}"
        </h2>
      </div>

      {/* 🌟 DUAL PRESENTER BOARDROOM GRID (AI INTERVIEWER + CANDIDATE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* SCREEN 1: AI INTERVIEWER AVATAR */}
        <div className="relative aspect-video rounded-2xl bg-slate-900 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6">
          {/* Avatar Realistic Graphic */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-700 shadow-2xl bg-gradient-to-b from-slate-800 to-slate-950">
            {isSpeakingAI && (
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            )}
            
            {/* Visual Cutout / Avatar Graphic */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl select-none">
                {interviewerGender === 'female' ? '👩‍💼' : '👨‍💼'}
              </div>
            </div>
          </div>

          {/* AI Presenter Title Banner */}
          <div className="mt-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSpeakingAI ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <h3 className="text-sm font-extrabold text-slate-100">
                {interviewerGender === 'female' ? 'Sarah Jenkins' : 'David Vance'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {interviewerGender === 'female' ? 'Principal Talent Partner • Acme Tech' : 'Senior Engineering Lead • Acme Tech'}
            </p>
          </div>

          {/* Audio Waves when Speaking */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              {isSpeakingAI ? 'AI Narration Active' : 'Listening for Answer...'}
            </span>
            <div className="flex items-center gap-1">
              {[12, 24, 16, 32, 20, 28, 14, 22, 30, 18].map((h, i) => (
                <span 
                  key={i} 
                  className={`w-1 rounded-full ${isSpeakingAI ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`}
                  style={{ height: isSpeakingAI ? `${h}px` : '6px' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SCREEN 2: CANDIDATE LIVE WEBCAM & TRANSCRIPTION */}
        <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="text-center space-y-3 p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-slate-300">
                <Mic className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-slate-200">Voice-Only Microphone Mode Active</p>
              <p className="text-[11px] text-slate-500">Camera disabled for privacy</p>
            </div>
          )}

          {/* Live Recording Badge */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/95 text-white text-xs font-black shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>REC 00:{(durationSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}

          {/* Live Filler Counter Pill */}
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Fillers: {totalFillers}</span>
          </div>

          {/* Candidate Audio Waveform Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              {isRecording ? 'Capturing Candidate Speech' : 'Mic Ready • Click Start'}
            </span>
            <div className="flex items-center gap-1">
              {[12, 24, 16, 32, 20, 28, 14, 22, 30, 18].map((h, i) => (
                <span 
                  key={i} 
                  className={`w-1 rounded-full ${isRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}
                  style={{ height: isRecording ? `${h}px` : '6px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Box & Real-Time Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-300">Candidate Answer Transcript (Live Speech / Type):</span>
          <span className="text-emerald-400 font-semibold">{isRecording ? '🎙️ Listening & Transcribing...' : 'Paused'}</span>
        </div>

        <textarea
          value={currentAnswer}
          onChange={e => setCurrentAnswer(e.target.value)}
          placeholder="Speak your response into the microphone, or type your answer here..."
          rows={2}
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none font-sans"
        />

        {/* Media & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecording}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isRecording ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isRecording ? 'Pause Recording' : 'Start Answer'}</span>
            </button>

            <button
              onClick={() => { setCurrentAnswer(''); setDurationSeconds(0); }}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStopAndEvaluateNow}
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <StopCircle className="w-4 h-4 text-amber-400" />
              <span>Stop & Evaluate Now</span>
            </button>

            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <span>{currentQIndex < questions.length - 1 ? `Next Question (${currentQIndex + 2} of 6)` : 'Complete Interview & View Report'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
