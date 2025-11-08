"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Play, StopCircle, SkipForward, AlertCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  question: string;
  type: string;
  answered: boolean;
}

interface Answer {
  questionId: string;
  question: string;
  transcript: string;
  videoUrl?: string;
  feedback: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keyPoints: string[];
  };
  timestamp: number;
}

interface InterviewReport {
  id: string;
  userId: string;
  role: string;
  skills: string[];
  startTime: number;
  endTime: number;
  answers: Answer[];
  overallScore: number;
  overallFeedback: string;
  recommendations: string[];
}

export default function InterviewPage() {
  const router = useRouter();
  const { userProfile, user } = useAuth();
  const userSkills = userProfile?.skills || [];
  const selectedRole = userProfile?.selectedRole || null;

  // Interview state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentRecordingStart, setCurrentRecordingStart] = useState<number>(0);

  // AI state
  const [processingAnswer, setProcessingAnswer] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize camera and questions
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
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setStartTime(Date.now());
    startAnswering();
  };

  const startAnswering = () => {
    if (!mediaStreamRef.current) return;

    setIsRecording(true);
    setCurrentRecordingStart(Date.now());
    setTranscript("");
    recordedChunksRef.current = [];

    // Start recording
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

    // Start speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => {
          const newTranscript = prev + finalTranscript;
          return newTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    }
  };

  const stopAnswering = async () => {
    setIsRecording(false);

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    // Process the answer
    await processAnswer();
  };

  const processAnswer = async () => {
    setProcessingAnswer(true);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      // Create video blob
      const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Get AI feedback using Gemini
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          question: currentQuestion.question,
          transcript: transcript,
          role: selectedRole,
          skills: userSkills,
          previousAnswers: answers.map(a => ({
            question: a.question,
            transcript: a.transcript
          }))
        }),
      });

      const data = await res.json();
      const feedback = data.evaluation;

      // Store answer
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        transcript: transcript,
        videoUrl: videoUrl,
        feedback: {
          score: feedback.score || 0,
          strengths: feedback.strengths || [],
          weaknesses: feedback.weaknesses || [],
          suggestions: feedback.suggestions || [],
          keyPoints: feedback.keyPoints || []
        },
        timestamp: Date.now()
      };

      setAnswers(prev => [...prev, newAnswer]);
      setCurrentFeedback(feedback);

      // Mark question as answered
      setQuestions(prev => prev.map((q, idx) =>
          idx === currentQuestionIndex ? { ...q, answered: true } : q
      ));

      // If Gemini suggests a follow-up, add it to questions
      if (feedback.followUpQuestion && currentQuestionIndex < questions.length - 1) {
        setQuestions(prev => {
          const newQuestions = [...prev];
          newQuestions.splice(currentQuestionIndex + 1, 0, {
            id: `followup${Date.now()}`,
            question: feedback.followUpQuestion,
            type: "followup",
            answered: false
          });
          return newQuestions;
        });
      }

    } catch (err) {
      console.error("Error processing answer:", err);
    } finally {
      setProcessingAnswer(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript("");
      setCurrentFeedback(null);
      recordedChunksRef.current = [];
    } else {
      endInterview();
    }
  };

  const endInterview = async () => {
    setInterviewEnded(true);
    stopAllMedia();
    await generateFinalReport();
  };

  const generateFinalReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/interview/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          role: selectedRole,
          skills: userSkills,
          answers: answers,
          startTime: startTime,
          endTime: Date.now()
        }),
      });

      const data = await res.json();
      const report: InterviewReport = data.report;

      setFinalReport(report);

      // Report is already saved via individual question evaluations

    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setGeneratingReport(false);
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
            <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Card className="p-8">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-2">Setup Required</h2>
                <p className="text-muted-foreground mb-4">
                  Please add skills and select a target role in your profile before starting an interview.
                </p>
                <Button onClick={() => router.push("/profile")}>Go to Profile</Button>
              </div>
            </Card>
          </div>
        </ProtectedRoute>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((answers.length / questions.length) * 100) : 0;

  return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            {!interviewEnded ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column - Video Feed */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative bg-black aspect-video">
                          <video
                              ref={videoRef}
                              className="w-full h-auto rounded-lg shadow-lg"
                              autoPlay
                              playsInline
                              muted
                              style={{ transform: 'scaleX(-1)' }}
                          />
                          {!videoEnabled && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <VideoOff className="h-16 w-16 text-gray-400" />
                              </div>
                          )}

                          {/* Recording indicator */}
                          {isRecording && (
                              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Recording</span>
                              </div>
                          )}

                          {/* Controls overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex items-center justify-center gap-4">
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={toggleVideo}
                                  className="rounded-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20"
                              >
                                {videoEnabled ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
                              </Button>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={toggleAudio}
                                  className="rounded-full bg-white/10 backdrop-blur border-white/20 hover:bg-white/20"
                              >
                                {audioEnabled ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Live Transcript */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Mic className="h-5 w-5" />
                          Live Transcript
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                          {transcript ? (
                              <p className="text-sm leading-relaxed">{transcript}</p>
                          ) : (
                              <p className="text-sm text-muted-foreground italic">
                                {isRecording ? "Listening..." : "Start recording to see your transcript here"}
                              </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current Feedback */}
                    {currentFeedback && (
                        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                          <CardContent className="p-4">
                            <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">
                              AI Feedback
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Score</span>
                                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {currentFeedback.score}/10
                            </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                      className="bg-green-600 h-2 rounded-full transition-all"
                                      style={{ width: `${(currentFeedback.score / 10) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {currentFeedback.strengths && currentFeedback.strengths.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1 text-green-800 dark:text-green-200">Strengths:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      {currentFeedback.strengths.map((s: string, i: number) => (
                                          <li key={i} className="text-sm">{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                              )}

                              {currentFeedback.suggestions && currentFeedback.suggestions.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-1 text-green-800 dark:text-green-200">Suggestions:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      {currentFeedback.suggestions.map((s: string, i: number) => (
                                          <li key={i} className="text-sm">{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                    )}
                  </div>

                  {/* Right Column - Questions & Controls */}
                  <div className="space-y-4">
                    {/* Interview Progress */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Interview Progress</h3>
                            <span className="text-sm text-muted-foreground">
                          {answers.length} / {questions.length}
                        </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Role: <span className="font-medium text-foreground">{selectedRole}</span></p>
                            <p>Duration: <span className="font-medium text-foreground">
                          {startTime > 0 ? Math.floor((Date.now() - startTime) / 60000) : 0} min
                        </span></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current Question */}
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-200">
                          Question {currentQuestionIndex + 1}
                        </h3>
                        <p className="text-lg font-medium mb-4 text-blue-900 dark:text-blue-100">
                          {currentQuestion?.question || "Loading question..."}
                        </p>

                        {!interviewStarted ? (
                            <Button onClick={startInterview} className="w-full" size="lg">
                              <Play className="mr-2 h-5 w-5" />
                              Start Interview
                            </Button>
                        ) : (
                            <div className="space-y-2">
                              {!isRecording ? (
                                  <>
                                    <Button
                                        onClick={startAnswering}
                                        className="w-full"
                                        disabled={processingAnswer}
                                    >
                                      <Mic className="mr-2 h-4 w-4" />
                                      Start Recording Answer
                                    </Button>
                                    {answers.length > 0 && (
                                        <Button
                                            onClick={nextQuestion}
                                            variant="outline"
                                            className="w-full"
                                            disabled={processingAnswer}
                                        >
                                          <SkipForward className="mr-2 h-4 w-4" />
                                          {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
                                        </Button>
                                    )}
                                  </>
                              ) : (
                                  <Button
                                      onClick={stopAnswering}
                                      variant="destructive"
                                      className="w-full"
                                      disabled={processingAnswer}
                                  >
                                    <StopCircle className="mr-2 h-4 w-4" />
                                    {processingAnswer ? "Processing..." : "Stop & Submit Answer"}
                                  </Button>
                              )}
                            </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Question Queue */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold mb-3">Question Queue</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {questions.map((q, idx) => (
                              <div
                                  key={q.id}
                                  className={`p-3 rounded-lg text-sm transition-all cursor-pointer ${
                                      idx === currentQuestionIndex
                                          ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-400"
                                          : q.answered
                                              ? "bg-green-100 dark:bg-green-900 opacity-60"
                                              : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() => !isRecording && setCurrentQuestionIndex(idx)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium">Q{idx + 1}</span>
                                  {q.answered && <span className="text-xs text-green-600 dark:text-green-400">✓</span>}
                                </div>
                                <p className="text-xs mt-1 line-clamp-2">{q.question}</p>
                              </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
            ) : (
                /* Final Report View */
                <Card className="max-w-4xl mx-auto">
                  <CardContent className="p-8">
                    {generatingReport ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <h2 className="text-2xl font-bold mb-2">Generating Your Report...</h2>
                          <p className="text-muted-foreground">Our AI is analyzing your performance</p>
                        </div>
                    ) : finalReport ? (
                        <div className="space-y-6">
                          <div className="text-center border-b pb-6">
                            <h1 className="text-3xl font-bold mb-2">Interview Complete! 🎉</h1>
                            <p className="text-muted-foreground">Here's your comprehensive performance report</p>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                                <p className="text-4xl font-bold text-blue-600">{finalReport.overallScore}/10</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Questions Answered</p>
                                <p className="text-4xl font-bold">{finalReport.answers.length}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                                <p className="text-4xl font-bold">
                                  {Math.floor((finalReport.endTime - finalReport.startTime) / 60000)} min
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                            <CardContent className="p-6">
                              <h3 className="text-xl font-semibold mb-3">Overall Feedback</h3>
                              <p className="leading-relaxed">{finalReport.overallFeedback}</p>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                              <ul className="space-y-2">
                                {finalReport.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>{rec}</span>
                                    </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-xl font-semibold mb-4">Question-by-Question Analysis</h3>
                              <div className="space-y-4">
                                {finalReport.answers.map((answer, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2">
                                      <h4 className="font-semibold mb-2">Q{idx + 1}: {answer.question}</h4>
                                      <div className="text-sm space-y-1">
                                        <p><strong>Score:</strong> {answer.feedback.score}/10</p>
                                        {answer.videoUrl && (
                                            <video
                                                controls
                                                className="w-full max-w-md mt-2 rounded"
                                                src={answer.videoUrl}
                                            />
                                        )}
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mt-2">
                                          <p className="text-xs font-semibold mb-1">Your Answer:</p>
                                          <p className="text-xs italic">{answer.transcript.substring(0, 200)}...</p>
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex gap-4 justify-center pt-4">
                            <Button onClick={() => router.push("/profile")} variant="outline">
                              View Saved Reports
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                              Start New Interview
                            </Button>
                          </div>
                        </div>
                    ) : null}
                  </CardContent>
                </Card>
            )}
          </div>
        </div>
      </ProtectedRoute>
  );
}