import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vital-signs')
@UseGuards(JwtAuthGuard)
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createVitalSignDto: CreateVitalSignDto) {
    return this.vitalSignsService.create(user.userId, createVitalSignDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.vitalSignsService.findAll(user.userId, petId);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any, @Query('petId') petId: string) {
    return this.vitalSignsService.getStats(user.userId, petId);
  }
}

