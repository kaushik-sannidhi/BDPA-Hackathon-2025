"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Play, StopCircle, SkipForward, AlertCircle, BarChart3 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { InterviewReview } from "@/components/InterviewReview";
import { useAppStore, AnswerRecord } from "@/lib/store";

interface Question {
  id: string;
  question: string;
  type: string;
  answered: boolean;
}

export default function InterviewPage() {
  const router = useRouter();
  const { userProfile, user } = useAuth();
  const { addAnsweredQuestion } = useAppStore();
  
  const userSkills = userProfile?.skills || [];
  const selectedRole = userProfile?.selectedRole || null;
  const [view, setView] = useState<"interview" | "review">("interview");

  // Interview state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");

  // AI state
  const [processingAnswer, setProcessingAnswer] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const lastSpokenQuestionRef = useRef<string | null>(null);

  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [interviewerVoice, setInterviewerVoice] = useState<SpeechSynthesisVoice | null>(null);

  const selectPreferredVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    if (!voices.length) {
      return null;
    }

    const preferredNames = [
      "Microsoft Aria",
      "Microsoft Jenny",
      "Microsoft Guy",
      "Microsoft Ana",
      "Jenny",
      "Aria",
      "Guy",
      "Neural",
      "Natural",
      "Google US English",
      "Google UK English Female",
      "Samantha",
      "Alex",
    ];

    for (const name of preferredNames) {
      const match = voices.find((voice) => voice.name.includes(name));
      if (match) {
        return match;
      }
    }

    const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
    const neuralVoice = englishVoices.find((voice) => /neural|natural|studio|premium/i.test(voice.name));
    if (neuralVoice) {
      return neuralVoice;
    }

    const femaleVoice = englishVoices.find((voice) => /female|woman|girl/i.test(voice.name));
    if (femaleVoice) {
      return femaleVoice;
    }

    return englishVoices[0] ?? voices[0] ?? null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    setSpeechAvailable(true);
    const synth = window.speechSynthesis;

    const updateVoice = () => {
      const voices = synth.getVoices();
      if (!voices.length) {
        return;
      }
      const preferred = selectPreferredVoice(voices) ?? voices[0] ?? null;
      setInterviewerVoice(preferred);
    };

    updateVoice();
    synth.addEventListener("voiceschanged", updateVoice);

    return () => {
      synth.removeEventListener("voiceschanged", updateVoice);
    };
  }, [selectPreferredVoice]);

  const speakQuestion = useCallback(
    (text: string) => {
      if (!speechAvailable || !text?.trim()) {
        return;
      }
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      const synth = window.speechSynthesis;
      try {
        synth.cancel();
      } catch (err) {
        console.warn("Unable to cancel previous speech synthesis:", err);
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (interviewerVoice) {
        utterance.voice = interviewerVoice;
      }
      utterance.pitch = 1;
      utterance.rate = 0.96;
      utterance.volume = 0.92;
      synth.speak(utterance);
    },
    [interviewerVoice, speechAvailable],
  );

  useEffect(() => {
    if (!interviewerVoice) {
      return;
    }
    lastSpokenQuestionRef.current = null;
  }, [interviewerVoice]);

  useEffect(() => {
    if (!speechAvailable || !interviewStarted) {
      return;
    }
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return;
    }
    if (lastSpokenQuestionRef.current === currentQuestion.id) {
      return;
    }

    lastSpokenQuestionRef.current = currentQuestion.id;
    speakQuestion(currentQuestion.question);
  }, [speechAvailable, interviewStarted, currentQuestionIndex, questions, speakQuestion]);

  useEffect(() => {
    if (selectedRole && userSkills.length > 0) {
      initializeInterview();
    }
    return () => {
      stopAllMedia();
    };
  }, [selectedRole, userSkills]);

  const initializeInterview = async () => {
    await startCamera();
    await generateQuestions();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please grant permissions.");
    }
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          skills: userSkills,
          count: 8
        }),
      });
      const data = await res.json();
      const formattedQuestions = (data.questions || []).map((q: any, idx: number) => ({
        id: `q${idx}`,
        question: q.question || q,
        type: q.type || "behavioral",
        answered: false
      }));
      setQuestions(formattedQuestions);
    } catch (err) {
      console.error("Error generating questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    startAnswering();
  };

  const startAnswering = () => {
    if (!mediaStreamRef.current) return;

    setIsRecording(true);
    setTranscript("");
    setCurrentFeedback(null);
    recordedChunksRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: "video/webm;codecs=vp8,opus"
      });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error("Recording error:", err);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
        }
      };
      recognition.onerror = (event: any) => console.warn("Speech recognition error:", event.error);
      recognition.start();
      speechRecognitionRef.current = recognition;
    }
  };

  const stopAnswering = async () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    await processAnswer();
  };

  const processAnswer = async () => {
    setProcessingAnswer(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      console.error('No current question found');
      setProcessingAnswer(false);
      return;
    }

    try {
      const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(videoBlob);

      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          question: currentQuestion.question,
          transcript: transcript,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      const evaluation = data.evaluation;

      const newAnswer: AnswerRecord = {
        id: `${Date.now()}`,
        question: currentQuestion.question,
        transcript: transcript,
        videoUrl: videoUrl,
        feedback: {
          overallScore: evaluation.overallScore || 0,
          rubricScores: evaluation.rubricScores || {
            clarityConciseness: 0,
            relevance: 0,
            depthDetail: 0,
            technicalAccuracy: 0,
            problemSolvingApproach: 0,
          },
          strengths: evaluation.strengths || [],
          weaknesses: evaluation.weaknesses || [],
          suggestions: evaluation.suggestions || [],
          keyPoints: evaluation.keyPoints || []
        },
        role: selectedRole!,
        timestamp: Date.now()
      };

      addAnsweredQuestion(newAnswer);
      setCurrentFeedback(evaluation);

      setQuestions(prev => prev.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, answered: true } : q
      ));

    } catch (err) {
      console.error("Error processing answer:", err);
    } finally {
      setProcessingAnswer(false);
    }
  };

  const nextQuestion = () => {
    const answeredCount = questions.filter(q => q.answered).length;
    if (answeredCount === questions.length) {
        setView('review');
        return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript("");
      setCurrentFeedback(null);
      recordedChunksRef.current = [];
    } else {
      // Loop back to first unanswered
      const nextIndex = questions.findIndex(q => !q.answered);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
      }
    }
  };

  const stopAllMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn("Failed to cancel speech synthesis:", err);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  if (!selectedRole || userSkills.length === 0) {
    return (
        <ProtectedRoute>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="p-8 text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-2">Setup Required</h2>
                <p className="text-muted-foreground mb-4">
                  Please add skills and select a target role in your profile before starting an interview.
                </p>
                <Button onClick={() => router.push("/profile")}>Go to Profile</Button>
            </Card>
          </div>
        </ProtectedRoute>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = questions.filter(q => q.answered).length;
  const progress = questions.length > 0 ? ((answeredCount / questions.length) * 100) : 0;

  if (view === 'review') {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Button variant="ghost" onClick={() => setView('interview')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Interview
          </Button>
          <InterviewReview />
        </div>
      </ProtectedRoute>
    )
  }

  return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => setView('review')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Video Feed */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative bg-black aspect-video">
                      <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
                      {!videoEnabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <VideoOff className="h-16 w-16 text-gray-400" />
                          </div>
                      )}
                      {isRecording && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            <span>Recording</span>
                          </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-center gap-4">
                          <Button variant="outline" size="icon" onClick={toggleVideo} className="rounded-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20">
                            {videoEnabled ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={toggleAudio} className="rounded-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20">
                            {audioEnabled ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Live Transcript</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                      <p className="text-sm leading-relaxed">{transcript || <span className="italic text-muted-foreground">Listening...</span>}</p>
                    </div>
                  </CardContent>
                </Card>

                {currentFeedback && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">AI Feedback</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Score</span>
                                                            <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                            {currentFeedback.overallScore}/10
                                                          </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">                                  <div
                                      className="bg-green-600 h-2 rounded-full transition-all"
                                      style={{ width: `${(currentFeedback.overallScore / 10) * 100}%` }}
                                  /></div>
                          </div>
                          {currentFeedback.strengths?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Strengths:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">{currentFeedback.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                              </div>
                          )}
                          {currentFeedback.suggestions?.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Suggestions:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">{currentFeedback.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                              </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2"><h3 className="text-lg font-semibold">Interview Progress</h3><span className="text-sm text-muted-foreground">{answeredCount} / {questions.length}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} /></div>
                    <p className="text-sm text-muted-foreground mt-2">Role: <span className="font-medium text-foreground">{selectedRole}</span></p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">Question {currentQuestionIndex + 1}</h3>
                    <p className="text-lg font-medium mb-4 text-blue-900 dark:text-blue-100">
                      {loadingQuestions ? (
                        <span className="inline-flex items-center"><svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>Generating questions...</span>
                      ) : (
                        currentQuestion?.question || ""
                      )}
                    </p>
                    {!interviewStarted ? (
                        <Button onClick={startInterview} className="w-full" size="lg"><Play className="mr-2 h-5 w-5" />Start Interview</Button>
                    ) : (
                        <div className="space-y-2">
                          {!isRecording ? (
                              <>
                                <Button onClick={startAnswering} className="w-full" disabled={processingAnswer}><Mic className="mr-2 h-4 w-4" />Record Answer</Button>
                                {currentFeedback && <Button onClick={nextQuestion} variant="outline" className="w-full" disabled={processingAnswer}><SkipForward className="mr-2 h-4 w-4" />{answeredCount === questions.length ? "Finish & View Reports" : "Next Question"}</Button>}
                              </>
                          ) : (
                              <Button onClick={stopAnswering} variant="destructive" className="w-full" disabled={processingAnswer}>
                                {processingAnswer ? (
                                  <>
                                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <StopCircle className="mr-2 h-4 w-4" />
                                    Stop & Submit
                                  </>
                                )}
                              </Button>
                          )}
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3">Question Queue</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {questions.map((q, idx) => (
                          <div key={q.id} className={`p-3 rounded-lg text-sm transition-all cursor-pointer ${idx === currentQuestionIndex ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-400" : q.answered ? "bg-green-100 dark:bg-green-900 opacity-60" : "bg-gray-100 dark:bg-gray-800"}`} onClick={() => !isRecording && setCurrentQuestionIndex(idx)}>
                            <div className="flex items-start justify-between gap-2"><span className="font-medium">Q{idx + 1}</span>{q.answered && <span className="text-xs text-green-600 dark:text-green-400">✓</span>}</div>
                            <p className="text-xs mt-1 line-clamp-2">{q.question}</p>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
  );
}
