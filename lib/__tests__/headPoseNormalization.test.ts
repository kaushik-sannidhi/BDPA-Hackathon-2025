import { describe, it, expect } from "vitest";
import { normalizeHeadPose } from "../signalProcessing";

describe("headPoseNormalization", () => {
  it("should normalize perfect head pose to 1", () => {
    const score = normalizeHeadPose(0, 0, 0);
    expect(score).toBeCloseTo(1, 1);
  });

  it("should decrease score with increasing yaw", () => {
    const score0 = normalizeHeadPose(0, 0, 0);
    const score10 = normalizeHeadPose(10, 0, 0);
    const score20 = normalizeHeadPose(20, 0, 0);
    const score30 = normalizeHeadPose(30, 0, 0);

    expect(score0).toBeGreaterThan(score10);
    expect(score10).toBeGreaterThan(score20);
    expect(score20).toBeGreaterThan(score30);
  });

  it("should decrease score with increasing pitch", () => {
    const score0 = normalizeHeadPose(0, 0, 0);
    const score10 = normalizeHeadPose(0, 10, 0);
    const score20 = normalizeHeadPose(0, 20, 0);

    expect(score0).toBeGreaterThan(score10);
    expect(score10).toBeGreaterThan(score20);
  });

  it("should decrease score with increasing roll", () => {
    const score0 = normalizeHeadPose(0, 0, 0);
    const score7 = normalizeHeadPose(0, 0, 7);
    const score15 = normalizeHeadPose(0, 0, 15);

    expect(score0).toBeGreaterThan(score7);
    expect(score7).toBeGreaterThan(score15);
  });

  it("should handle negative angles", () => {
    const scorePos = normalizeHeadPose(15, 0, 0);
    const scoreNeg = normalizeHeadPose(-15, 0, 0);
    // Should be similar (absolute value)
    expect(Math.abs(scorePos - scoreNeg)).toBeLessThan(0.1);
  });

  it("should return 0 for extreme angles", () => {
    const score = normalizeHeadPose(90, 90, 90);
    expect(score).toBeCloseTo(0, 1);
  });

  it("should weight yaw and pitch more than roll", () => {
    const scoreYaw = normalizeHeadPose(15, 0, 0);
    const scoreRoll = normalizeHeadPose(0, 0, 15);
    // Yaw should have more impact
    expect(scoreYaw).toBeLessThan(scoreRoll);
  });

  it("should always return values between 0 and 1", () => {
    const testCases = [
      [0, 0, 0],
      [30, 20, 15],
      [-30, -20, -15],
      [45, 30, 20],
      [90, 90, 90],
    ];

    testCases.forEach(([yaw, pitch, roll]) => {
      const score = normalizeHeadPose(yaw, pitch, roll);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});

