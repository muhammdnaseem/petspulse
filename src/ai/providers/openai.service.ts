import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAIService,
  HealthAnalysisRequest,
  HealthAnalysisResponse,
  SymptomAnalysisRequest,
  SymptomAnalysisResponse,
} from '../interfaces/ai-service.interface';

@Injectable()
export class OpenAIService implements IAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async analyzeHealth(
    request: HealthAnalysisRequest,
  ): Promise<HealthAnalysisResponse> {
    if (!this.openai) {
      return this.getDefaultHealthAnalysis();
    }

    const prompt = this.buildHealthAnalysisPrompt(request);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a veterinary AI assistant. Provide accurate, helpful health analysis for pets. Always recommend consulting a veterinarian for serious concerns.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return this.parseHealthAnalysisResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getDefaultHealthAnalysis();
    }
  }

  async analyzeSymptoms(
    request: SymptomAnalysisRequest,
  ): Promise<SymptomAnalysisResponse> {
    if (!this.openai) {
      return this.getDefaultSymptomAnalysis();
    }

    const prompt = this.buildSymptomAnalysisPrompt(request);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a veterinary triage AI. Analyze symptoms and provide severity assessment. Always recommend emergency care for critical symptoms.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return this.parseSymptomAnalysisResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getDefaultSymptomAnalysis();
    }
  }

  async generateHealthForecast(petId: string, data: any): Promise<string> {
    if (!this.openai) {
      return 'Health forecasting requires AI service configuration.';
    }

    const prompt = `Based on the following pet health data, provide a 3-month health forecast:
${JSON.stringify(data, null, 2)}

Provide a concise forecast focusing on potential health trends and recommendations.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a veterinary AI providing health forecasts. Be realistic and helpful.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      return 'Unable to generate forecast at this time.';
    }
  }

  async detectAnomalies(data: any[]): Promise<any[]> {
    // Simple anomaly detection - can be enhanced
    if (data.length < 2) return [];

    const anomalies: any[] = [];
    // Implement basic statistical anomaly detection
    return anomalies;
  }

  async calculateHealthScore(petId: string, data: any): Promise<number> {
    // Calculate health score based on various factors
    let score = 100;

    // Deduct points for various issues
    if (data.abnormalVitalSigns) score -= 20;
    if (data.recentSymptoms) score -= 15;
    if (data.missedVaccinations) score -= 10;
    if (data.inactive) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private buildHealthAnalysisPrompt(request: HealthAnalysisRequest): string {
    return `Analyze the health data for a ${request.species}${request.breed ? ` (${request.breed})` : ''}:

Health History: ${JSON.stringify(request.healthHistory)}
Vital Signs: ${JSON.stringify(request.vitalSigns)}
${request.symptoms ? `Current Symptoms: ${request.symptoms.join(', ')}` : ''}

Provide:
1. A summary of overall health status
2. Key trends observed
3. Recommendations for care
4. Risk level (low/medium/high)
5. Confidence score (0-100)`;
  }

  private buildSymptomAnalysisPrompt(
    request: SymptomAnalysisRequest,
  ): string {
    return `Analyze symptoms for a ${request.species}${request.breed ? ` (${request.breed})` : ''}:
Symptoms: ${request.symptoms.join(', ')}
Age: ${request.age || 'unknown'}
Current Medications: ${request.currentMedications?.join(', ') || 'none'}

Provide:
1. Possible conditions with probabilities
2. Severity assessment (low/medium/high/critical)
3. Recommended action
4. Urgency level (routine/soon/urgent/emergency)`;
  }

  private parseHealthAnalysisResponse(content: string): HealthAnalysisResponse {
    // Simple parsing - in production, use structured output or better parsing
    return {
      summary: content.substring(0, 200) || 'Health analysis completed',
      trends: ['Trend analysis available'],
      recommendations: ['Regular check-ups recommended'],
      riskLevel: 'medium',
      confidence: 75,
    };
  }

  private parseSymptomAnalysisResponse(
    content: string,
  ): SymptomAnalysisResponse {
    return {
      possibleConditions: [
        {
          condition: 'General assessment',
          probability: 0.5,
          description: content.substring(0, 100),
        },
      ],
      severity: 'medium',
      recommendedAction: 'Monitor closely and consult veterinarian if symptoms persist',
      urgency: 'soon',
    };
  }

  private getDefaultHealthAnalysis(): HealthAnalysisResponse {
    return {
      summary: 'AI service not configured. Please configure OpenAI API key.',
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
      recommendedAction: 'Please consult with a veterinarian for proper diagnosis.',
      urgency: 'routine',
    };
  }
}

