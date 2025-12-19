import { Injectable } from '@nestjs/common';
import { AIService } from '../ai.service';

@Injectable()
export class SymptomCheckerService {
  constructor(private aiService: AIService) {}

  async analyze(petId: string, userId: string, symptoms: string[]) {
    return this.aiService.analyzeSymptoms(petId, userId, symptoms);
  }

  async triage(petId: string, userId: string, symptoms: string[]) {
    const analysis = await this.analyze(petId, userId, symptoms);

    return {
      severity: analysis.severity,
      urgency: analysis.urgency,
      recommendedAction: analysis.recommendedAction,
      possibleConditions: analysis.possibleConditions,
      shouldSeeVet: ['high', 'critical'].includes(analysis.severity),
      emergency: analysis.urgency === 'emergency',
    };
  }

  async getRecommendations(petId: string, userId: string) {
    // Get recent symptoms and provide recommendations
    const analysis = await this.aiService.analyzeHealth(petId, userId);
    return {
      recommendations: analysis.recommendations,
      riskLevel: analysis.riskLevel,
    };
  }
}

