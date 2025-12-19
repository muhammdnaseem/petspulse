export interface HealthAnalysisRequest {
  petId: string;
  species: string;
  breed?: string;
  healthHistory: any[];
  vitalSigns: any[];
  symptoms?: string[];
}

export interface HealthAnalysisResponse {
  summary: string;
  trends: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface SymptomAnalysisRequest {
  species: string;
  breed?: string;
  symptoms: string[];
  age?: number;
  currentMedications?: string[];
}

export interface SymptomAnalysisResponse {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
}

export interface IAIService {
  analyzeHealth(request: HealthAnalysisRequest): Promise<HealthAnalysisResponse>;
  analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse>;
  generateHealthForecast(petId: string, data: any): Promise<string>;
  detectAnomalies(data: any[]): Promise<any[]>;
  calculateHealthScore(petId: string, data: any): Promise<number>;
}

