import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { SymptomCheckerService } from './symptom-checker/symptom-checker.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly symptomCheckerService: SymptomCheckerService,
  ) {}

  @Post('analyze-health')
  analyzeHealth(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
  ) {
    return this.aiService.analyzeHealth(petId, user.userId);
  }

  @Post('forecast')
  forecast(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
  ) {
    return this.aiService.forecast(petId, user.userId);
  }

  @Get('health-score/:petId')
  getHealthScore(
    @CurrentUser() user: any,
    @Param('petId') petId: string,
  ) {
    return this.aiService.getHealthScore(petId, user.userId);
  }

  @Post('anomaly-detection')
  detectAnomalies(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
  ) {
    return this.aiService.detectAnomalies(petId, user.userId);
  }
}

