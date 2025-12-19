import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      ownerId: userId,
      dateOfBirth: createPetDto.dateOfBirth
        ? new Date(createPetDto.dateOfBirth)
        : null,
    });

    return this.petsRepository.save(pet);
  }

  async findAll(userId: string): Promise<Pet[]> {
    return this.petsRepository.find({
      where: { ownerId: userId },
      relations: ['healthEntries', 'vitalSigns', 'medications', 'vaccinations'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id },
      relations: [
        'healthEntries',
        'vitalSigns',
        'medications',
        'vaccinations',
        'alertRules',
      ],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return pet;
  }

  async update(
    id: string,
    userId: string,
    updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    const pet = await this.findOne(id, userId);

    Object.assign(pet, {
      ...updatePetDto,
      dateOfBirth: updatePetDto.dateOfBirth
        ? new Date(updatePetDto.dateOfBirth)
        : pet.dateOfBirth,
    });

    return this.petsRepository.save(pet);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.findOne(id, userId);
    await this.petsRepository.remove(pet);
  }

  async uploadPhoto(id: string, userId: string, file: Express.Multer.File) {
    const pet = await this.findOne(id, userId);

    const uploadResult = await this.cloudinaryService.uploadImage(file);

    pet.photoUrl = uploadResult.secure_url;
    await this.petsRepository.save(pet);

    return { photoUrl: pet.photoUrl };
  }
}

