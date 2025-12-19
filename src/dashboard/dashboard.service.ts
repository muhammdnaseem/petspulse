import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../pets/entities/pet.entity';
import { HealthEntry } from '../health-entries/entities/health-entry.entity';
import { VitalSign } from '../vital-signs/entities/vital-sign.entity';
import { Medication } from '../medications/entities/medication.entity';
import { Vaccination } from '../vaccinations/entities/vaccination.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(HealthEntry)
    private healthEntriesRepository: Repository<HealthEntry>,
    @InjectRepository(VitalSign)
    private vitalSignsRepository: Repository<VitalSign>,
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    @InjectRepository(Vaccination)
    private vaccinationsRepository: Repository<Vaccination>,
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
    private petsService: PetsService,
  ) {}

  async getOverview(userId: string) {
    const pets = await this.petsRepository.find({
      where: { ownerId: userId },
    });

    const petIds = pets.map((pet) => pet.id);

    const [
      totalHealthEntries,
      totalVitalSigns,
      activeMedications,
      upcomingVaccinations,
      recentAlerts,
    ] = await Promise.all([
      this.healthEntriesRepository.count({
        where: petIds.length > 0 ? { petId: petIds[0] } : {},
      }),
      this.vitalSignsRepository.count({
        where: petIds.length > 0 ? { petId: petIds[0] } : {},
      }),
      this.medicationsRepository.count({
        where: petIds.length > 0 ? { petId: petIds[0], isActive: true } : {},
      }),
      this.vaccinationsRepository
        .createQueryBuilder('vaccination')
        .where('vaccination.petId IN (:...petIds)', { petIds })
        .andWhere('vaccination.nextDueDate >= :today', {
          today: new Date(),
        })
        .andWhere('vaccination.nextDueDate <= :nextMonth', {
          nextMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .getCount(),
      this.alertsRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      totalPets: pets.length,
      totalHealthEntries,
      totalVitalSigns,
      activeMedications,
      upcomingVaccinations,
      recentAlerts,
    };
  }

  async getChartData(petId: string, userId: string, type: string) {
    await this.petsService.findOne(petId, userId);

    switch (type) {
      case 'vital-signs':
        const vitalSigns = await this.vitalSignsRepository.find({
          where: { petId },
          order: { recordedAt: 'ASC' },
          take: 30,
        });

        return {
          labels: vitalSigns.map((vs) =>
            vs.recordedAt.toISOString().split('T')[0],
          ),
          temperature: vitalSigns.map((vs) => vs.temperature),
          heartRate: vitalSigns.map((vs) => vs.heartRate),
          respiratoryRate: vitalSigns.map((vs) => vs.respiratoryRate),
        };

      case 'health-entries':
        const healthEntries = await this.healthEntriesRepository.find({
          where: { petId },
          order: { entryDate: 'ASC' },
          take: 30,
        });

        return {
          labels: healthEntries.map((he) =>
            he.entryDate.toISOString().split('T')[0],
          ),
          activityLevel: healthEntries.map((he) => he.activityLevel),
        };

      default:
        return {};
    }
  }
}

