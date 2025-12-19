import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview(@CurrentUser() user: any) {
    return this.dashboardService.getOverview(user.userId);
  }

  @Get('charts/:petId')
  getChartData(
    @CurrentUser() user: any,
    @Param('petId') petId: string,
    @Query('type') type: string,
  ) {
    return this.dashboardService.getChartData(petId, user.userId, type);
  }
}

