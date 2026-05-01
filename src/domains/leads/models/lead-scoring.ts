import { z } from "zod";

export const leadScoringSchema = z.object({
  sellThroughRating: z.number().int().min(1).max(5),
  confidenceScore: z.number().int().min(1).max(100),
});

export function getSellThroughLabel(rating: number) {
  if (rating >= 5) {
    return "Fast";
  }

  if (rating >= 4) {
    return "Healthy";
  }

  if (rating >= 3) {
    return "Moderate";
  }

  return "Slow";
}

export function getConfidenceLabel(score: number) {
  if (score >= 90) {
    return "High confidence";
  }

  if (score >= 75) {
    return "Solid confidence";
  }

  return "Watch closely";
}
