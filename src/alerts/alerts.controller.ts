import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.alertsService.findAll(user.userId, petId);
  }

  @Post('rules')
  createAlertRule(
    @CurrentUser() user: any,
    @Body() createAlertRuleDto: CreateAlertRuleDto,
  ) {
    return this.alertsService.createAlertRule(user.userId, createAlertRuleDto);
  }

  @Get('rules')
  findAllAlertRules(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.alertsService.findAllAlertRules(user.userId, petId);
  }

  @Patch('rules/:id')
  updateAlertRule(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateAlertRuleDto: UpdateAlertRuleDto,
  ) {
    return this.alertsService.updateAlertRule(
      id,
      user.userId,
      updateAlertRuleDto,
    );
  }

  @Delete('rules/:id')
  removeAlertRule(@CurrentUser() user: any, @Param('id') id: string) {
    return this.alertsService.removeAlertRule(id, user.userId);
  }
}

