import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    private petsService: PetsService,
  ) {}

  async create(userId: string, createMedicationDto: CreateMedicationDto) {
    await this.petsService.findOne(createMedicationDto.petId, userId);

    const medication = this.medicationsRepository.create({
      ...createMedicationDto,
      startDate: createMedicationDto.startDate
        ? new Date(createMedicationDto.startDate)
        : null,
      endDate: createMedicationDto.endDate
        ? new Date(createMedicationDto.endDate)
        : null,
    });

    return this.medicationsRepository.save(medication);
  }

  async findAll(userId: string, petId?: string) {
    const where: any = {};
    if (petId) {
      where.petId = petId;
    }

    const medications = await this.medicationsRepository.find({
      where,
      relations: ['pet'],
      order: { createdAt: 'DESC' },
    });

    return medications.filter((med) => med.pet.ownerId === userId);
  }

  async findOne(id: string, userId: string) {
    const medication = await this.medicationsRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    if (medication.pet.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return medication;
  }

  async update(
    id: string,
    userId: string,
    updateMedicationDto: UpdateMedicationDto,
  ) {
    const medication = await this.findOne(id, userId);

    Object.assign(medication, {
      ...updateMedicationDto,
      startDate: updateMedicationDto.startDate
        ? new Date(updateMedicationDto.startDate)
        : medication.startDate,
      endDate: updateMedicationDto.endDate
        ? new Date(updateMedicationDto.endDate)
        : medication.endDate,
    });

    return this.medicationsRepository.save(medication);
  }

  async remove(id: string, userId: string) {
    const medication = await this.findOne(id, userId);
    await this.medicationsRepository.remove(medication);
  }

  async checkInteractions(petId: string, userId: string) {
    await this.petsService.findOne(petId, userId);

    const activeMedications = await this.medicationsRepository.find({
      where: { petId, isActive: true },
    });

    // This would integrate with a drug interaction API
    // For now, return a placeholder response
    return {
      medications: activeMedications.map((m) => m.name),
      interactions: [],
      warnings: [],
    };
  }

  async getSchedule(petId: string, userId: string) {
    await this.petsService.findOne(petId, userId);

    const medications = await this.medicationsRepository.find({
      where: { petId, isActive: true },
    });

    return medications.map((med) => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      instructions: med.instructions,
    }));
  }
}

