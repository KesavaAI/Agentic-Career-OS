import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Mic, MicOff, Volume2, Sparkles, 
  Clock, AlertTriangle, CheckCircle2, ChevronRight, RotateCcw, 
  Video, Play, Square, MessageSquare 
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
  onFinishSession: (sessionData: any) => void;
  onCancel: () => void;
}

export const VideoInterviewArena: React.FC<VideoInterviewArenaProps> = ({
  role,
  company,
  onFinishSession,
  onCancel
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [detectedFillers, setDetectedFillers] = useState<Record<string, number>>({ um: 0, like: 0, uh: 0 });
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const questions: QuestionItem[] = [
    { id: 1, question: "Tell me about yourself and walk me through your technical background.", category: "Introduction", timeLimitSeconds: 120 },
    { id: 2, question: `Why are you interested in joining ${company} as a ${role}?`, category: "Motivation & Company Fit", timeLimitSeconds: 90 },
    { id: 3, question: "How do you optimize slow, complex queries when handling millions of database rows?", category: "Technical Problem Solving", timeLimitSeconds: 120 },
    { id: 4, question: "Walk me through how you design high-availability error handling and recovery in production.", category: "System Architecture", timeLimitSeconds: 150 },
    { id: 5, question: "Describe a situation where you had a strong technical disagreement with a team member. How did you resolve it?", category: "Behavioral & Conflict", timeLimitSeconds: 120 },
    { id: 6, question: "Tell me about your most challenging project. What went wrong, and what was the quantifiable outcome?", category: "Flagship Project Defense", timeLimitSeconds: 180 }
  ];

  const currentQ = questions[currentQIndex];

  // Initialize camera and speech recognition
  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera/Mic permission denied or not available, using simulated stream:", err);
        setCameraActive(false);
      }
    }

    setupMedia();

    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
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

        // Real-time filler detection
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setDurationSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
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

  const handleNextQuestion = () => {
    const recordedQA = {
      question_number: currentQIndex + 1,
      question: currentQ.question,
      answer: currentAnswer || "In our project we analyzed metrics using SQL and resolved bottlenecks. It improved application response times significantly for all our active users.",
      duration_seconds: durationSeconds || 75
    };

    const newAnswers = [...answers, recordedQA];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    setDurationSeconds(0);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setIsRecording(false);
    } else {
      // Completed all questions -> Generate report
      onFinishSession({
        role,
        company,
        questions_and_answers: newAnswers,
        total_duration_seconds: newAnswers.reduce((acc, a) => acc + (a.duration_seconds || 60), 0)
      });
    }
  };

  const totalFillers = (detectedFillers.um || 0) + (detectedFillers.like || 0) + (detectedFillers.uh || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
              AI Video Studio: {company} — {role}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Live adaptive technical & behavioral simulation</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, '0')}</span>
            <span className="text-slate-500">/ {currentQ.timeLimitSeconds}s limit</span>
          </div>
          <button 
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            Exit Studio
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-1 items-center">
        {/* Left: AI Question Prompt */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                Question {currentQIndex + 1} of {questions.length} • {currentQ.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Pacing: ~{currentQ.timeLimitSeconds}s
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 leading-snug">
              "{currentQ.question}"
            </h3>

            {/* Live Real-Time Filler Counter */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${totalFillers > 5 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="text-slate-300">Live Filler Words:</span>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">um: {detectedFillers.um}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">like: {detectedFillers.like}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">uh: {detectedFillers.uh}</span>
              </div>
            </div>

            {/* Answer Transcription / Manual Edit Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Real-time Transcribed Answer:</span>
                <span className="text-emerald-400">{isRecording ? '🎙️ Listening...' : 'Paused'}</span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Speak into your microphone or type your answer here..."
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Camera Feed */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-xl aspect-video rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
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
              <div className="text-center space-y-2 text-slate-500">
                <Video className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs font-semibold">Webcam stream active / simulated video audio track</p>
              </div>
            )}

            {/* Recording Badge */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>RECORDING LIVE</span>
              </div>
            )}

            {/* Audio Waveform Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono">{isRecording ? 'Capturing Audio & Speech' : 'Mic Ready'}</span>
              </div>
              <div className="flex items-center gap-1">
                {[12, 24, 16, 32, 20, 28, 14, 22, 30, 18, 26, 12].map((h, i) => (
                  <span 
                    key={i} 
                    className={`w-1 rounded-full ${isRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}
                    style={{ height: isRecording ? `${h}px` : '6px' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`p-3 rounded-full border transition-all ${
                cameraActive ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-red-500/20 border-red-500 text-red-400'
              }`}
            >
              {cameraActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleRecording}
              className={`px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{isRecording ? 'Pause Recording' : 'Start Answer'}</span>
            </button>

            <button
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-full border transition-all ${
                micActive ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-red-500/20 border-red-500 text-red-400'
              }`}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => { setCurrentAnswer(''); setDurationSeconds(0); }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Answer</span>
        </button>

        <button
          onClick={handleNextQuestion}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <span>{currentQIndex < questions.length - 1 ? 'Save & Next Question' : 'Complete & Generate Diagnostic'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
