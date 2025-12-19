import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { OpenAIService } from './providers/openai.service';
import { AnthropicService } from './providers/anthropic.service';
import { AIServiceFactory } from './providers/ai-service.factory';
import { SymptomCheckerService } from './symptom-checker/symptom-checker.service';
import { SymptomCheckerController } from './symptom-checker/symptom-checker.controller';
import { Pet } from '../pets/entities/pet.entity';
import { HealthEntry } from '../health-entries/entities/health-entry.entity';
import { VitalSign } from '../vital-signs/entities/vital-sign.entity';
import { Medication } from '../medications/entities/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pet, HealthEntry, VitalSign, Medication]),
  ],
  controllers: [AIController, SymptomCheckerController],
  providers: [
    AIService,
    OpenAIService,
    AnthropicService,
    AIServiceFactory,
    SymptomCheckerService,
  ],
  exports: [AIService, AIServiceFactory],
})
export class AiModule {}

