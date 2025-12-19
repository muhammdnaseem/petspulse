import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIService } from '../interfaces/ai-service.interface';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';

@Injectable()
export class AIServiceFactory {
  constructor(
    private configService: ConfigService,
    private openAIService: OpenAIService,
    private anthropicService: AnthropicService,
  ) {}

  getService(): IAIService {
    const provider = this.configService.get<string>('AI_PROVIDER', 'openai');

    switch (provider.toLowerCase()) {
      case 'openai':
        return this.openAIService;
      case 'anthropic':
        return this.anthropicService;
      default:
        return this.openAIService; // Default to OpenAI
    }
  }
}

