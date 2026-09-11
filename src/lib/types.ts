export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  location: string;
  start_date: string;
  plantation_date: string;
  total_saplings: number;
  budget: number;
  target_survival_rate: number;
}

export interface Cluster {
  id: string;
  project_id: string;
  name: string;
  total_saplings: number;
  risk_score: number;
  risk_level: RiskLevel;
  main_issues: string[];
}

export interface Sapling {
  id: string;
  project_id: string;
  cluster_id: string;
  species: string;
  planted_at: string;
  latitude: number;
  longitude: number;
  status: 'ALIVE' | 'WEAK' | 'DEAD' | 'REPLACED' | 'NOT_FOUND';
  health_score: number; // 0-100
  last_watered_at: string; // ISO date string
  last_inspected_at: string; // ISO date string
  guard_status: 'GOOD' | 'DAMAGED' | 'MISSING';
  animal_damage: boolean;
  grass_cutting_risk: boolean;
  dry_period_flag: boolean;
  risk_score: number; // 0-100
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  cluster_id: string;
  project_id: string;
  title: string;
  reason: string;
  recommended_action: string;
  deadline: string; // ISO date string
  status: 'PENDING' | 'COMPLETED';
  trees_affected: number;
  priority: number; // Lower is higher priority
}

export interface RiskEvent {
  date: string;
  score: number;
  level: RiskLevel;
}
