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
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('medications')
@UseGuards(JwtAuthGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationsService.create(user.userId, createMedicationDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.medicationsService.findAll(user.userId, petId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.medicationsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.medicationsService.update(id, user.userId, updateMedicationDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.medicationsService.remove(id, user.userId);
  }

  @Post('check-interactions')
  checkInteractions(
    @CurrentUser() user: any,
    @Body('petId') petId: string,
  ) {
    return this.medicationsService.checkInteractions(petId, user.userId);
  }

  @Get('schedule/:petId')
  getSchedule(@CurrentUser() user: any, @Param('petId') petId: string) {
    return this.medicationsService.getSchedule(petId, user.userId);
  }
}

