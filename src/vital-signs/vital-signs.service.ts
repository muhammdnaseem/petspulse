import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSign } from './entities/vital-sign.entity';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class VitalSignsService {
  constructor(
    @InjectRepository(VitalSign)
    private vitalSignsRepository: Repository<VitalSign>,
    private petsService: PetsService,
  ) {}

  async create(userId: string, createVitalSignDto: CreateVitalSignDto) {
    await this.petsService.findOne(createVitalSignDto.petId, userId);

    const vitalSign = this.vitalSignsRepository.create({
      ...createVitalSignDto,
      recordedAt: createVitalSignDto.recordedAt
        ? new Date(createVitalSignDto.recordedAt)
        : new Date(),
    });

    return this.vitalSignsRepository.save(vitalSign);
  }

  async findAll(userId: string, petId?: string) {
    const where: any = {};
    if (petId) {
      where.petId = petId;
    }

    const vitalSigns = await this.vitalSignsRepository.find({
      where,
      relations: ['pet'],
      order: { recordedAt: 'DESC' },
    });

    return vitalSigns.filter((vs) => vs.pet.ownerId === userId);
  }

  async getStats(userId: string, petId: string) {
    await this.petsService.findOne(petId, userId);

    const vitalSigns = await this.vitalSignsRepository.find({
      where: { petId },
      order: { recordedAt: 'DESC' },
      take: 30, // Last 30 readings
    });

    if (vitalSigns.length === 0) {
      return {
        averageTemperature: null,
        averageHeartRate: null,
        averageRespiratoryRate: null,
        latestWeight: null,
      };
    }

    const temps = vitalSigns
      .map((vs) => vs.temperature)
      .filter((t) => t !== null);
    const heartRates = vitalSigns
      .map((vs) => vs.heartRate)
      .filter((hr) => hr !== null);
    const respRates = vitalSigns
      .map((vs) => vs.respiratoryRate)
      .filter((rr) => rr !== null);
    const weights = vitalSigns
      .map((vs) => vs.weight)
      .filter((w) => w !== null);

    return {
      averageTemperature:
        temps.length > 0
          ? temps.reduce((a, b) => a + b, 0) / temps.length
          : null,
      averageHeartRate:
        heartRates.length > 0
          ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length
          : null,
      averageRespiratoryRate:
        respRates.length > 0
          ? respRates.reduce((a, b) => a + b, 0) / respRates.length
          : null,
      latestWeight: weights.length > 0 ? weights[0] : null,
    };
  }
}

