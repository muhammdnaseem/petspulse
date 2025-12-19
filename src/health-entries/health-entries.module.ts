import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthEntriesService } from './health-entries.service';
import { HealthEntriesController } from './health-entries.controller';
import { HealthEntry } from './entities/health-entry.entity';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [TypeOrmModule.forFeature([HealthEntry]), PetsModule],
  controllers: [HealthEntriesController],
  providers: [HealthEntriesService],
  exports: [HealthEntriesService],
})
export class HealthEntriesModule {}

