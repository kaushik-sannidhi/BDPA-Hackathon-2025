import { describe, it, expect } from "vitest";
import {
  smoothSignal,
  normalizeHeadPose,
  calculateEyeContactScore,
  detectBlink,
} from "../signalProcessing";

describe("signalProcessing", () => {
  describe("smoothSignal", () => {
    it("should return empty array for empty input", () => {
      expect(smoothSignal([])).toEqual([]);
    });

    it("should return same array if length is less than window size", () => {
      const input = [1, 2, 3];
      expect(smoothSignal(input, 5)).toEqual([1, 2, 3]);
    });

    it("should smooth signal with default window size", () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = smoothSignal(input);
      expect(result.length).toBe(input.length);
      expect(result[0]).toBeCloseTo(1.5, 1);
      expect(result[result.length - 1]).toBeCloseTo(9.5, 1);
    });

    it("should smooth signal with custom window size", () => {
      const input = [10, 20, 30, 40, 50];
      const result = smoothSignal(input, 3);
      expect(result.length).toBe(input.length);
      // First value should be average of first two
      expect(result[0]).toBeCloseTo(15, 1);
    });

    it("should handle noisy data", () => {
      const input = [50, 80, 45, 90, 40, 85, 50];
      const result = smoothSignal(input, 3);
      // Smoothed values should be less extreme
      expect(Math.max(...result)).toBeLessThan(Math.max(...input));
      expect(Math.min(...result)).toBeGreaterThan(Math.min(...input));
    });
  });

  describe("normalizeHeadPose", () => {
    it("should return 1 for perfect head pose (0, 0, 0)", () => {
      const score = normalizeHeadPose(0, 0, 0);
      expect(score).toBeCloseTo(1, 1);
    });

    it("should return lower score for large yaw", () => {
      const score1 = normalizeHeadPose(30, 0, 0);
      const score2 = normalizeHeadPose(0, 0, 0);
      expect(score1).toBeLessThan(score2);
    });

    it("should return lower score for large pitch", () => {
      const score1 = normalizeHeadPose(0, 20, 0);
      const score2 = normalizeHeadPose(0, 0, 0);
      expect(score1).toBeLessThan(score2);
    });

    it("should return lower score for large roll", () => {
      const score1 = normalizeHeadPose(0, 0, 15);
      const score2 = normalizeHeadPose(0, 0, 0);
      expect(score1).toBeLessThan(score2);
    });

    it("should return score between 0 and 1", () => {
      const score = normalizeHeadPose(45, 30, 20);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should handle extreme angles", () => {
      const score = normalizeHeadPose(90, 90, 90);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(0.5);
    });
  });

  describe("calculateEyeContactScore", () => {
    it("should return high score for open eyes and forward head", () => {
      const score = calculateEyeContactScore(0.8, 0);
      expect(score).toBeGreaterThan(0.7);
    });

    it("should return low score for closed eyes", () => {
      const score = calculateEyeContactScore(0.1, 0);
      expect(score).toBeLessThan(0.5);
    });

    it("should return lower score when looking away", () => {
      const score1 = calculateEyeContactScore(0.8, 30);
      const score2 = calculateEyeContactScore(0.8, 0);
      expect(score1).toBeLessThan(score2);
    });

    it("should return score between 0 and 1", () => {
      const score = calculateEyeContactScore(0.5, 20);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("should handle edge cases", () => {
      const score1 = calculateEyeContactScore(0, 0);
      expect(score1).toBe(0);

      const score2 = calculateEyeContactScore(1, 0);
      expect(score2).toBeGreaterThan(0.5);
    });
  });

  describe("detectBlink", () => {
    it("should detect a blink pattern", () => {
      const history = [0.6, 0.5, 0.1, 0.6, 0.7];
      expect(detectBlink(history)).toBe(true);
    });

    it("should not detect blink if eyes stay open", () => {
      const history = [0.6, 0.7, 0.65, 0.7];
      expect(detectBlink(history)).toBe(false);
    });

    it("should not detect blink if eyes stay closed", () => {
      const history = [0.1, 0.15, 0.1, 0.2];
      expect(detectBlink(history)).toBe(false);
    });

    it("should return false for insufficient data", () => {
      expect(detectBlink([])).toBe(false);
      expect(detectBlink([0.5])).toBe(false);
      expect(detectBlink([0.5, 0.6])).toBe(false);
    });

    it("should detect rapid blink", () => {
      const history = [0.7, 0.1, 0.8];
      expect(detectBlink(history)).toBe(true);
    });
  });
});

