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
import { HealthEntriesService } from './health-entries.service';
import { CreateHealthEntryDto } from './dto/create-health-entry.dto';
import { UpdateHealthEntryDto } from './dto/update-health-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('health-entries')
@UseGuards(JwtAuthGuard)
export class HealthEntriesController {
  constructor(private readonly healthEntriesService: HealthEntriesService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createHealthEntryDto: CreateHealthEntryDto,
  ) {
    return this.healthEntriesService.create(user.userId, createHealthEntryDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.healthEntriesService.findAll(user.userId, petId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.healthEntriesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateHealthEntryDto: UpdateHealthEntryDto,
  ) {
    return this.healthEntriesService.update(id, user.userId, updateHealthEntryDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.healthEntriesService.remove(id, user.userId);
  }
}

