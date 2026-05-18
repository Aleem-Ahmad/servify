/**
 * Calculates a provider's trust score and assigns a badge.
 * 
 * Logic:
 * - Base Score: 50
 * - Completed Jobs: +2 per job (max 30)
 * - Response Time: +10 if < 30m, +5 if < 60m, -5 if > 120m
 * - Complaints: -10 per valid complaint
 * - Feedback: (Avg Rating * 2) (max 10)
 */
export function calculateTrustScore(metrics) {
  const { completedJobs, avgResponseTime, complaintHistory, avgRating } = metrics;
  
  let score = 50; // Starting point

  // Job Completion
  score += Math.min(completedJobs * 2, 30);

  // Response Time
  if (avgResponseTime > 0) {
    if (avgResponseTime < 30) score += 10;
    else if (avgResponseTime < 60) score += 5;
    else if (avgResponseTime > 120) score -= 5;
  }

  // Complaints
  score -= (complaintHistory * 10);

  // Ratings
  if (avgRating) {
    score += (avgRating * 2);
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(score, 100));

  // Assign Badge
  let badge = 'Basic';
  if (score >= 90) badge = 'Elite';
  else if (score >= 75) badge = 'Pro';

  return { score, badge };
}
