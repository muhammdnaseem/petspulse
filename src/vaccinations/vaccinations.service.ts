import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccination } from './entities/vaccination.entity';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectRepository(Vaccination)
    private vaccinationsRepository: Repository<Vaccination>,
    private petsService: PetsService,
  ) {}

  async create(userId: string, createVaccinationDto: CreateVaccinationDto) {
    await this.petsService.findOne(createVaccinationDto.petId, userId);

    const vaccination = this.vaccinationsRepository.create({
      ...createVaccinationDto,
      vaccinationDate: new Date(createVaccinationDto.vaccinationDate),
      nextDueDate: createVaccinationDto.nextDueDate
        ? new Date(createVaccinationDto.nextDueDate)
        : null,
    });

    return this.vaccinationsRepository.save(vaccination);
  }

  async findAll(userId: string, petId?: string) {
    const where: any = {};
    if (petId) {
      where.petId = petId;
    }

    const vaccinations = await this.vaccinationsRepository.find({
      where,
      relations: ['pet'],
      order: { vaccinationDate: 'DESC' },
    });

    return vaccinations.filter((vac) => vac.pet.ownerId === userId);
  }

  async findOne(id: string, userId: string) {
    const vaccination = await this.vaccinationsRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!vaccination) {
      throw new NotFoundException('Vaccination not found');
    }

    if (vaccination.pet.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return vaccination;
  }

  async update(
    id: string,
    userId: string,
    updateVaccinationDto: UpdateVaccinationDto,
  ) {
    const vaccination = await this.findOne(id, userId);

    Object.assign(vaccination, {
      ...updateVaccinationDto,
      vaccinationDate: updateVaccinationDto.vaccinationDate
        ? new Date(updateVaccinationDto.vaccinationDate)
        : vaccination.vaccinationDate,
      nextDueDate: updateVaccinationDto.nextDueDate
        ? new Date(updateVaccinationDto.nextDueDate)
        : vaccination.nextDueDate,
    });

    return this.vaccinationsRepository.save(vaccination);
  }

  async remove(id: string, userId: string) {
    const vaccination = await this.findOne(id, userId);
    await this.vaccinationsRepository.remove(vaccination);
  }
}

