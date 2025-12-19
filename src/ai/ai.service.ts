import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../pets/entities/pet.entity';
import { HealthEntry } from '../health-entries/entities/health-entry.entity';
import { VitalSign } from '../vital-signs/entities/vital-sign.entity';
import { Medication } from '../medications/entities/medication.entity';
import { AIServiceFactory } from './providers/ai-service.factory';
import {
  HealthAnalysisRequest,
  SymptomAnalysisRequest,
} from './interfaces/ai-service.interface';

@Injectable()
export class AIService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(HealthEntry)
    private healthEntriesRepository: Repository<HealthEntry>,
    @InjectRepository(VitalSign)
    private vitalSignsRepository: Repository<VitalSign>,
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    private aiServiceFactory: AIServiceFactory,
  ) {}

  async analyzeHealth(petId: string, userId: string) {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const [healthEntries, vitalSigns, medications] = await Promise.all([
      this.healthEntriesRepository.find({
        where: { petId },
        order: { entryDate: 'DESC' },
        take: 30,
      }),
      this.vitalSignsRepository.find({
        where: { petId },
        order: { recordedAt: 'DESC' },
        take: 30,
      }),
      this.medicationsRepository.find({
        where: { petId, isActive: true },
      }),
    ]);

    const request: HealthAnalysisRequest = {
      petId,
      species: pet.species,
      breed: pet.breed,
      healthHistory: healthEntries,
      vitalSigns,
    };

    const aiService = this.aiServiceFactory.getService();
    return aiService.analyzeHealth(request);
  }

  async analyzeSymptoms(
    petId: string,
    userId: string,
    symptoms: string[],
  ) {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const medications = await this.medicationsRepository.find({
      where: { petId, isActive: true },
    });

    const request: SymptomAnalysisRequest = {
      species: pet.species,
      breed: pet.breed,
      symptoms,
      age: pet.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(pet.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : undefined,
      currentMedications: medications.map((m) => m.name),
    };

    const aiService = this.aiServiceFactory.getService();
    return aiService.analyzeSymptoms(request);
  }

  async forecast(petId: string, userId: string) {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const [healthEntries, vitalSigns] = await Promise.all([
      this.healthEntriesRepository.find({ where: { petId } }),
      this.vitalSignsRepository.find({ where: { petId } }),
    ]);

    const data = {
      pet: { species: pet.species, breed: pet.breed },
      healthEntries,
      vitalSigns,
    };

    const aiService = this.aiServiceFactory.getService();
    return aiService.generateHealthForecast(petId, data);
  }

  async detectAnomalies(petId: string, userId: string) {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const vitalSigns = await this.vitalSignsRepository.find({
      where: { petId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });

    const aiService = this.aiServiceFactory.getService();
    return aiService.detectAnomalies(vitalSigns);
  }

  async getHealthScore(petId: string, userId: string) {
    const pet = await this.petsRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    const [healthEntries, vitalSigns, medications] = await Promise.all([
      this.healthEntriesRepository.find({
        where: { petId },
        order: { entryDate: 'DESC' },
        take: 10,
      }),
      this.vitalSignsRepository.find({
        where: { petId },
        order: { recordedAt: 'DESC' },
        take: 10,
      }),
      this.medicationsRepository.find({ where: { petId } }),
    ]);

    const data = {
      abnormalVitalSigns: vitalSigns.some((vs) => {
        // Simple check for abnormal values
        return (
          (vs.temperature && (vs.temperature < 99 || vs.temperature > 103)) ||
          (vs.heartRate && (vs.heartRate < 60 || vs.heartRate > 160))
        );
      }),
      recentSymptoms: healthEntries.some(
        (he) => he.symptoms && he.symptoms.length > 0,
      ),
      missedVaccinations: false, // Would check vaccination records
      inactive: healthEntries.length === 0,
    };

    const aiService = this.aiServiceFactory.getService();
    return aiService.calculateHealthScore(petId, data);
  }
}

