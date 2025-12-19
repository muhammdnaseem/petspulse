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
import { VaccinationsService } from './vaccinations.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vaccinations')
@UseGuards(JwtAuthGuard)
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createVaccinationDto: CreateVaccinationDto,
  ) {
    return this.vaccinationsService.create(user.userId, createVaccinationDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.vaccinationsService.findAll(user.userId, petId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vaccinationsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateVaccinationDto: UpdateVaccinationDto,
  ) {
    return this.vaccinationsService.update(id, user.userId, updateVaccinationDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vaccinationsService.remove(id, user.userId);
  }
}

