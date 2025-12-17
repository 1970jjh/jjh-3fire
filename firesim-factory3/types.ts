
export type SimulationStep = 
  | 'INTRO' 
  | 'SITUATION' 
  | 'DEFINITION' 
  | 'ANALYSIS' 
  | 'SOLUTION' 
  | 'REPORT'
  | 'FEEDBACK';

export type UserRole = 'ADMIN' | 'STUDENT' | null;

export interface SessionConfig {
  id: string; 
  groupName: string;
  totalTeams: number; 
  createdAt: number;
  isReportEnabled: boolean; // Control report submission
}

export interface UserProfile {
  name: string;
  teamId: number; 
}

export interface PowerData {
  device: string;
  count: number;
  watts: number;
  active: boolean;
}

export interface FinalReportData {
  title: string;
  members: string;
  contents: string; // 목차
  situation: string;
  definition: string;
  cause: string;
  solution: string;
  prevention: string;
  schedule: string;
}

export interface SimulationState {
  currentStep: SimulationStep;
  user: UserProfile | null;
  teamName: string;
  timeLeft: number; 
  
  collectedFacts: string[];
  personalNotes: string[]; // New field for user specific notes
  
  gapAnalysis: {
    current: string;
    ideal: string;
  };
  
  powerCalculation: PowerData[];
  rootCauses: {
    human: string;
    machine: string;
    material: string;
    method: string;
  };
  
  solutions: {
    shortTerm: string;
    longTerm: string;
    prevention: string;
  };

  finalReport: FinalReportData | null;
}

export interface TeamProgress {
  id: string;
  name: string;
  step: SimulationStep;
  status: 'active' | 'completed' | 'danger';
  lastUpdate: string;
  score?: number;
}

export const INITIAL_POWER_DATA: PowerData[] = [
  { device: 'A Pro (기존)', count: 2, watts: 3500, active: true },
  { device: 'A Pro (4공장 이관)', count: 2, watts: 3500, active: true },
  { device: 'B Pro', count: 4, watts: 2000, active: true },
  { device: '항온항습기', count: 3, watts: 500, active: true },
];

export const MAX_POWER_LIMIT = 16000; // 16kW
