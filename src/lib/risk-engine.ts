import { Sapling, RiskLevel } from './types';

export function calculateRiskScore(sapling: Partial<Sapling>): number {
  let score = 0;
  const now = new Date();

  // Watering logic
  if (sapling.last_watered_at) {
    const daysSinceWatered = (now.getTime() - new Date(sapling.last_watered_at).getTime()) / (1000 * 3600 * 24);
    if (daysSinceWatered > 10) {
      score += 30;
    } else if (daysSinceWatered >= 6) {
      score += 15;
    }
  }

  // Animal damage
  if (sapling.animal_damage) score += 25;

  // Guard damage
  if (sapling.guard_status === 'DAMAGED' || sapling.guard_status === 'MISSING') score += 20;

  // Grass-cutting risk
  if (sapling.grass_cutting_risk) score += 15;

  // Health
  if (sapling.health_score !== undefined) {
    if (sapling.health_score < 40) score += 20;
    else if (sapling.health_score <= 60) score += 10;
  }

  // Inspection
  if (sapling.last_inspected_at) {
    const daysSinceInspected = (now.getTime() - new Date(sapling.last_inspected_at).getTime()) / (1000 * 3600 * 24);
    if (daysSinceInspected > 14) score += 15;
  }

  // Dry period
  if (sapling.dry_period_flag) score += 10;

  return Math.min(score, 100);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 30) return 'GREEN';
  if (score < 60) return 'YELLOW';
  if (score < 80) return 'RED';
  return 'CRITICAL';
}

export function recommendInterventions(sapling: Partial<Sapling>): string[] {
  const recommendations: string[] = [];
  
  if (sapling.status === 'DEAD' || sapling.status === 'NOT_FOUND') {
    return ["Replace sapling"];
  }

  if (sapling.animal_damage && sapling.guard_status !== 'GOOD') {
    recommendations.push("Repair protective guard");
    recommendations.push("Inspect for repeated animal access");
  }

  const now = new Date();
  if (sapling.last_watered_at) {
    const daysSinceWatered = (now.getTime() - new Date(sapling.last_watered_at).getTime()) / (1000 * 3600 * 24);
    if (daysSinceWatered >= 6) {
      recommendations.push("Water within 24 hours");
    }
  }

  if (sapling.health_score !== undefined && sapling.health_score < 40) {
    recommendations.push("Recheck health after intervention");
  }

  if (sapling.grass_cutting_risk) {
    recommendations.push("Inspect grass-cutting exposure");
  }

  if (recommendations.length === 0) {
    recommendations.push("Schedule regular field inspection");
  }

  return recommendations;
}
