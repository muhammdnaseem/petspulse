import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SymptomCheckerService } from './symptom-checker.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('symptom-checker')
@UseGuards(JwtAuthGuard)
export class SymptomCheckerController {
  constructor(
    private readonly symptomCheckerService: SymptomCheckerService,
  ) {}

  @Post('analyze')
  analyze(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
    @Body('symptoms') symptoms: string[],
  ) {
    return this.symptomCheckerService.analyze(petId, user.userId, symptoms);
  }

  @Post('triage')
  triage(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
    @Body('symptoms') symptoms: string[],
  ) {
    return this.symptomCheckerService.triage(petId, user.userId, symptoms);
  }

  @Get('recommendations/:petId')
  getRecommendations(
    @CurrentUser() user: any,
    @Param('petId') petId: string,
  ) {
    return this.symptomCheckerService.getRecommendations(petId, user.userId);
  }
}

