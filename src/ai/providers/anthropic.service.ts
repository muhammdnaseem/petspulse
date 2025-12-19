import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  IAIService,
  HealthAnalysisRequest,
  HealthAnalysisResponse,
  SymptomAnalysisRequest,
  SymptomAnalysisResponse,
} from '../interfaces/ai-service.interface';

@Injectable()
export class AnthropicService implements IAIService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async analyzeHealth(
    request: HealthAnalysisRequest,
  ): Promise<HealthAnalysisResponse> {
    if (!this.anthropic) {
      return this.getDefaultHealthAnalysis();
    }

    const prompt = this.buildHealthAnalysisPrompt(request);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content =
        response.content[0].type === 'text'
          ? response.content[0].text
          : 'Analysis unavailable';
      return this.parseHealthAnalysisResponse(content);
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.getDefaultHealthAnalysis();
    }
  }

  async analyzeSymptoms(
    request: SymptomAnalysisRequest,
  ): Promise<SymptomAnalysisResponse> {
    if (!this.anthropic) {
      return this.getDefaultSymptomAnalysis();
    }

    const prompt = this.buildSymptomAnalysisPrompt(request);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content =
        response.content[0].type === 'text'
          ? response.content[0].text
          : 'Analysis unavailable';
      return this.parseSymptomAnalysisResponse(content);
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.getDefaultSymptomAnalysis();
    }
  }

  async generateHealthForecast(petId: string, data: any): Promise<string> {
    if (!this.anthropic) {
      return 'Health forecasting requires AI service configuration.';
    }

    const prompt = `Based on the following pet health data, provide a 3-month health forecast:
${JSON.stringify(data, null, 2)}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].type === 'text'
        ? response.content[0].text
        : 'Unable to generate forecast.';
    } catch (error) {
      return 'Unable to generate forecast at this time.';
    }
  }

  async detectAnomalies(data: any[]): Promise<any[]> {
    return [];
  }

  async calculateHealthScore(petId: string, data: any): Promise<number> {
    let score = 100;
    if (data.abnormalVitalSigns) score -= 20;
    if (data.recentSymptoms) score -= 15;
    if (data.missedVaccinations) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  private buildHealthAnalysisPrompt(request: HealthAnalysisRequest): string {
    return `Analyze the health data for a ${request.species}${request.breed ? ` (${request.breed})` : ''}:
${JSON.stringify(request, null, 2)}`;
  }

  private buildSymptomAnalysisPrompt(
    request: SymptomAnalysisRequest,
  ): string {
    return `Analyze symptoms for a ${request.species}: ${request.symptoms.join(', ')}`;
  }

  private parseHealthAnalysisResponse(content: string): HealthAnalysisResponse {
    return {
      summary: content.substring(0, 200),
      trends: [],
      recommendations: [],
      riskLevel: 'medium',
      confidence: 75,
    };
  }

  private parseSymptomAnalysisResponse(
    content: string,
  ): SymptomAnalysisResponse {
    return {
      possibleConditions: [],
      severity: 'medium',
      recommendedAction: content.substring(0, 100),
      urgency: 'soon',
    };
  }

  private getDefaultHealthAnalysis(): HealthAnalysisResponse {
    return {
      summary: 'AI service not configured.',
      trends: [],
      recommendations: [],
      riskLevel: 'low',
      confidence: 0,
    };
  }

  private getDefaultSymptomAnalysis(): SymptomAnalysisResponse {
    return {
      possibleConditions: [],
      severity: 'low',
      recommendedAction: 'Consult a veterinarian.',
      urgency: 'routine',
    };
  }
}

