import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthEntry } from './entities/health-entry.entity';
import { CreateHealthEntryDto } from './dto/create-health-entry.dto';
import { UpdateHealthEntryDto } from './dto/update-health-entry.dto';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class HealthEntriesService {
  constructor(
    @InjectRepository(HealthEntry)
    private healthEntriesRepository: Repository<HealthEntry>,
    private petsService: PetsService,
  ) {}

  async create(userId: string, createHealthEntryDto: CreateHealthEntryDto) {
    // Verify pet ownership
    await this.petsService.findOne(createHealthEntryDto.petId, userId);

    const entry = this.healthEntriesRepository.create({
      ...createHealthEntryDto,
      entryDate: createHealthEntryDto.entryDate
        ? new Date(createHealthEntryDto.entryDate)
        : new Date(),
    });

    return this.healthEntriesRepository.save(entry);
  }

  async findAll(userId: string, petId?: string) {
    const where: any = {};
    if (petId) {
      where.petId = petId;
    }

    const entries = await this.healthEntriesRepository.find({
      where,
      relations: ['pet'],
      order: { entryDate: 'DESC' },
    });

    // Filter by ownership
    return entries.filter((entry) => entry.pet.ownerId === userId);
  }

  async findOne(id: string, userId: string) {
    const entry = await this.healthEntriesRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!entry) {
      throw new NotFoundException('Health entry not found');
    }

    if (entry.pet.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return entry;
  }

  async update(id: string, userId: string, updateHealthEntryDto: UpdateHealthEntryDto) {
    const entry = await this.findOne(id, userId);

    Object.assign(entry, {
      ...updateHealthEntryDto,
      entryDate: updateHealthEntryDto.entryDate
        ? new Date(updateHealthEntryDto.entryDate)
        : entry.entryDate,
    });

    return this.healthEntriesRepository.save(entry);
  }

  async remove(id: string, userId: string) {
    const entry = await this.findOne(id, userId);
    await this.healthEntriesRepository.remove(entry);
  }
}

