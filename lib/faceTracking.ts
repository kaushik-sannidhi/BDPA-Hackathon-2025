// Dynamic imports for TensorFlow.js (client-side only)
let faceLandmarksDetection: any = null;
let model: any = null;
let isModelLoading = false;

export async function loadFaceModel() {
  if (typeof window === "undefined") {
    throw new Error("Face tracking only works in the browser");
  }

  if (model) return model;
  if (isModelLoading) {
    // Wait for existing load
    while (isModelLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return model;
  }

  isModelLoading = true;
  try {
    // Dynamic import for client-side only
    if (!faceLandmarksDetection) {
      faceLandmarksDetection = await import("@tensorflow-models/face-landmarks-detection");
      await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-backend-webgl");
    }

    // Use TensorFlow.js runtime instead of MediaPipe to avoid build issues
    // MediaPipe requires additional packages that cause webpack bundling problems
    const detectorConfig = {
      runtime: "tfjs" as const,
      maxFaces: 1,
      refineLandmarks: true,
    };

    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      detectorConfig
    );
  } catch (error) {
    console.error("Failed to load face model:", error);
    throw error;
  } finally {
    isModelLoading = false;
  }
  return model;
}

export interface FaceMetrics {
  eyeOpenness: number; // 0-1
  headYaw: number; // degrees
  headPitch: number; // degrees
  headRoll: number; // degrees
  smileProbability: number; // 0-1
}

function calculateEyeOpenness(landmarks: number[], eyeIndices: number[]): number {
  if (eyeIndices.length < 4 || landmarks.length < Math.max(...eyeIndices) * 3 + 3) {
    return 0.5;
  }
  
  try {
    // Get eye corner and top/bottom points
    const eyeTop = landmarks[eyeIndices[0] * 3 + 1] || 0;
    const eyeBottom = landmarks[eyeIndices[1] * 3 + 1] || 0;
    const eyeLeft = landmarks[eyeIndices[2] * 3] || 0;
    const eyeRight = landmarks[eyeIndices[3] * 3] || 0;
    
    const eyeHeight = Math.abs(eyeTop - eyeBottom);
    const eyeWidth = Math.abs(eyeRight - eyeLeft);
    
    if (eyeWidth === 0) return 0.5;
    return Math.min(1, Math.max(0, eyeHeight / eyeWidth));
  } catch (error) {
    console.error("Error calculating eye openness:", error);
    return 0.5;
  }
}

function calculateHeadPose(landmarks: number[]): { yaw: number; pitch: number; roll: number } {
  try {
    // Simplified head pose estimation using key facial landmarks
    // MediaPipe FaceMesh has specific indices for nose tip, chin, etc.
    const noseTip = 1; // approximate
    const chin = 175; // approximate
    const leftEye = 33;
    const rightEye = 263;
    
    // Ensure we have enough landmarks
    const maxIndex = Math.max(noseTip, chin, leftEye, rightEye);
    if (landmarks.length < maxIndex * 3 + 3) {
      return { yaw: 0, pitch: 0, roll: 0 };
    }
    
    const noseX = landmarks[noseTip * 3] || 0;
    const noseY = landmarks[noseTip * 3 + 1] || 0;
    const chinX = landmarks[chin * 3] || 0;
    const chinY = landmarks[chin * 3 + 1] || 0;
    const leftEyeX = landmarks[leftEye * 3] || 0;
    const rightEyeX = landmarks[rightEye * 3] || 0;
    
    // Calculate yaw (left-right rotation)
    const eyeCenterX = (leftEyeX + rightEyeX) / 2;
    const yaw = (noseX - eyeCenterX) * 10; // scaled
    
    // Calculate pitch (up-down rotation)
    const pitch = (noseY - chinY) * 5; // scaled
    
    // Calculate roll (tilt)
    const eyeDiff = rightEyeX - leftEyeX;
    const roll = Math.atan2(eyeDiff, 100) * (180 / Math.PI);
    
    return { yaw, pitch, roll };
  } catch (error) {
    console.error("Error calculating head pose:", error);
    return { yaw: 0, pitch: 0, roll: 0 };
  }
}

function calculateSmile(landmarks: number[]): number {
  try {
    // Use mouth corner landmarks
    const leftMouthCorner = 61;
    const rightMouthCorner = 291;
    const upperLip = 13;
    const lowerLip = 14;
    
    const maxIndex = Math.max(leftMouthCorner, rightMouthCorner, upperLip, lowerLip);
    if (landmarks.length < maxIndex * 3 + 3) {
      return 0;
    }
    
    const leftCornerY = landmarks[leftMouthCorner * 3 + 1] || 0;
    const rightCornerY = landmarks[rightMouthCorner * 3 + 1] || 0;
    const upperLipY = landmarks[upperLip * 3 + 1] || 0;
    const lowerLipY = landmarks[lowerLip * 3 + 1] || 0;
    
    const mouthOpenness = Math.abs(lowerLipY - upperLipY);
    const mouthWidth = Math.abs((landmarks[rightMouthCorner * 3] || 0) - (landmarks[leftMouthCorner * 3] || 0));
    
    // Smile detection: wider mouth and slight upward curve
    const smileScore = Math.min(1, mouthWidth / 50) * (1 - Math.min(1, mouthOpenness / 20));
    return smileScore;
  } catch (error) {
    console.error("Error calculating smile:", error);
    return 0;
  }
}

export async function detectFaceMetrics(
  video: HTMLVideoElement
): Promise<FaceMetrics | null> {
  if (!model) {
    try {
      await loadFaceModel();
    } catch (error) {
      console.error("Failed to load face model:", error);
      return null;
    }
  }
  if (!model) return null;

  try {
    const faces = await model.estimateFaces(video, {
      flipHorizontal: false,
      staticImageMode: false,
    });

    if (!faces || faces.length === 0) return null;

    const face = faces[0];
    if (!face || !face.keypoints) return null;

    // Handle different keypoint formats
    let keypoints: any[] = [];
    if (Array.isArray(face.keypoints)) {
      keypoints = face.keypoints;
    } else if (face.keypoints && typeof face.keypoints === 'object') {
      keypoints = Object.values(face.keypoints);
    } else {
      return null;
    }

    if (keypoints.length === 0) return null;

    // Extract landmarks as flat array [x, y, z, x, y, z, ...]
    const landmarks: number[] = [];
    for (const kp of keypoints) {
      if (kp && typeof kp === 'object') {
        landmarks.push(
          kp.x !== undefined ? kp.x : (Array.isArray(kp) ? kp[0] || 0 : 0),
          kp.y !== undefined ? kp.y : (Array.isArray(kp) ? kp[1] || 0 : 0),
          kp.z !== undefined ? kp.z : (Array.isArray(kp) ? kp[2] || 0 : 0)
        );
      }
    }

    if (landmarks.length < 100) {
      // Need at least some landmarks to work with
      console.warn("Insufficient landmarks detected:", landmarks.length);
      return null;
    }

    // Eye indices for MediaPipe FaceMesh
    const leftEyeIndices = [159, 145, 33, 133]; // top, bottom, left, right
    const rightEyeIndices = [386, 374, 362, 263];

    const leftEyeOpenness = calculateEyeOpenness(landmarks, leftEyeIndices);
    const rightEyeOpenness = calculateEyeOpenness(landmarks, rightEyeIndices);
    const eyeOpenness = (leftEyeOpenness + rightEyeOpenness) / 2;

    const headPose = calculateHeadPose(landmarks);
    const smileProbability = calculateSmile(landmarks);

    return {
      eyeOpenness,
      headYaw: headPose.yaw,
      headPitch: headPose.pitch,
      headRoll: headPose.roll,
      smileProbability,
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return null;
  }
}

