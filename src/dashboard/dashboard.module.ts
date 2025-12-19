import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Pet } from '../pets/entities/pet.entity';
import { HealthEntry } from '../health-entries/entities/health-entry.entity';
import { VitalSign } from '../vital-signs/entities/vital-sign.entity';
import { Medication } from '../medications/entities/medication.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
      HealthEntry,
      VitalSign,
      Medication,
      Vaccination,
      Alert,
    ]),
    PetsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

