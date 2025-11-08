// Signal smoothing and processing utilities

export function smoothSignal(values: number[], windowSize: number = 5): number[] {
  if (values.length === 0) return [];
  if (values.length < windowSize) return values;

  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(values.length, i + halfWindow + 1);
    const window = values.slice(start, end);
    const average = window.reduce((a, b) => a + b, 0) / window.length;
    smoothed.push(average);
  }

  return smoothed;
}

export function normalizeHeadPose(yaw: number, pitch: number, roll: number): number {
  // Normalize head pose to a 0-1 score (1 = perfect, 0 = looking away)
  // Ideal: yaw=0, pitch=0, roll=0
  
  const yawScore = 1 - Math.min(1, Math.abs(yaw) / 30); // 30 degrees tolerance
  const pitchScore = 1 - Math.min(1, Math.abs(pitch) / 20); // 20 degrees tolerance
  const rollScore = 1 - Math.min(1, Math.abs(roll) / 15); // 15 degrees tolerance
  
  // Weighted average
  return (yawScore * 0.4 + pitchScore * 0.4 + rollScore * 0.2);
}

export function calculateEyeContactScore(eyeOpenness: number, headYaw: number): number {
  // Eye contact is good when eyes are open and head is facing forward
  const eyeScore = eyeOpenness > 0.3 ? 1 : eyeOpenness / 0.3;
  const headScore = 1 - Math.min(1, Math.abs(headYaw) / 25);
  
  return (eyeScore * 0.6 + headScore * 0.4);
}

export function detectBlink(eyeOpennessHistory: number[]): boolean {
  if (eyeOpennessHistory.length < 3) return false;
  
  // Blink detection: rapid drop and rise in eye openness
  const recent = eyeOpennessHistory.slice(-3);
  const [prev, curr, next] = recent;
  
  // Drop below threshold and then rise
  return prev > 0.4 && curr < 0.2 && next > 0.4;
}

