export interface AudioMetrics {
  speakingRatio: number; // 0-1
  fillerWordCount: number; // per minute
  averageVolume: number; // 0-1
}

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let stream: MediaStream | null = null;
let animationFrameId: number | null = null;
let volumeHistory: number[] = [];
let speakingThreshold = 0.02;
let silenceGapThreshold = 500; // ms
let lastSpeakingTime = 0;
let fillerWordCount = 0;
let sessionStartTime = 0;

export async function initAudioAnalysis(audioStream: MediaStream): Promise<void> {
  if (audioContext) {
    cleanupAudioAnalysis();
  }

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;

  microphone = audioContext.createMediaStreamSource(audioStream);
  microphone.connect(analyser);

  stream = audioStream;
  volumeHistory = [];
  fillerWordCount = 0;
  sessionStartTime = Date.now();
  lastSpeakingTime = Date.now();

  startAudioMonitoring();
}

function startAudioMonitoring() {
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function monitor() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / bufferLength / 255;
    volumeHistory.push(average);

    // Keep only last 2 seconds of history
    if (volumeHistory.length > 120) {
      volumeHistory.shift();
    }

    // Detect speaking
    if (average > speakingThreshold) {
      const now = Date.now();
      const gap = now - lastSpeakingTime;
      
      // If gap is large, might be a filler word pause
      if (gap > silenceGapThreshold && lastSpeakingTime > 0) {
        fillerWordCount++;
      }
      
      lastSpeakingTime = now;
    }

    animationFrameId = requestAnimationFrame(monitor);
  }

  monitor();
}

export function getAudioMetrics(): AudioMetrics {
  if (!volumeHistory.length) {
    return { speakingRatio: 0, fillerWordCount: 0, averageVolume: 0 };
  }

  const speakingFrames = volumeHistory.filter((v) => v > speakingThreshold).length;
  const speakingRatio = speakingFrames / volumeHistory.length;

  const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
  const fillerWordsPerMinute = sessionDuration > 0 ? fillerWordCount / sessionDuration : 0;

  const averageVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;

  return {
    speakingRatio,
    fillerWordCount: Math.round(fillerWordsPerMinute),
    averageVolume,
  };
}

export function cleanupAudioAnalysis() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (microphone) {
    microphone.disconnect();
    microphone = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  analyser = null;
  volumeHistory = [];
}

