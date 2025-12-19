import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder, ReminderStatus } from './entities/reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { PetsService } from '../pets/pets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VaccinationsService } from '../vaccinations/vaccinations.service';
import { MedicationsService } from '../medications/medications.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
    private petsService: PetsService,
    private notificationsService: NotificationsService,
    private vaccinationsService: VaccinationsService,
    private medicationsService: MedicationsService,
  ) {}

  async create(userId: string, createReminderDto: CreateReminderDto) {
    if (createReminderDto.petId) {
      await this.petsService.findOne(createReminderDto.petId, userId);
    }

    const reminder = this.remindersRepository.create({
      ...createReminderDto,
      userId,
      dueDate: new Date(createReminderDto.dueDate),
    });

    return this.remindersRepository.save(reminder);
  }

  async findAll(userId: string, petId?: string) {
    const where: any = { userId };
    if (petId) {
      where.petId = petId;
    }

    return this.remindersRepository.find({
      where,
      relations: ['pet'],
      order: { dueDate: 'ASC' },
    });
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.remindersRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return reminder;
  }

  async update(id: string, userId: string, updateReminderDto: UpdateReminderDto) {
    const reminder = await this.findOne(id, userId);

    Object.assign(reminder, {
      ...updateReminderDto,
      dueDate: updateReminderDto.dueDate
        ? new Date(updateReminderDto.dueDate)
        : reminder.dueDate,
    });

    return this.remindersRepository.save(reminder);
  }

  async remove(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);
    await this.remindersRepository.remove(reminder);
  }

  async complete(id: string, userId: string) {
    const reminder = await this.findOne(id, userId);
    reminder.status = ReminderStatus.COMPLETED;
    reminder.completedAt = new Date();
    return this.remindersRepository.save(reminder);
  }

  async generateAutomaticReminders(userId: string, petId: string) {
    const pet = await this.petsService.findOne(petId, userId);

    // Generate vaccination reminders
    const vaccinations = await this.vaccinationsService.findAll(userId, petId);
    for (const vaccination of vaccinations) {
      if (vaccination.nextDueDate) {
        const existingReminder = await this.remindersRepository.findOne({
          where: {
            userId,
            petId,
            type: 'vaccination' as any,
            metadata: { vaccinationId: vaccination.id } as any,
          },
        });

        if (!existingReminder && vaccination.nextDueDate > new Date()) {
          await this.create(userId, {
            petId,
            type: 'vaccination' as any,
            title: `Vaccination Due: ${vaccination.vaccineName}`,
            description: `${pet.name} is due for ${vaccination.vaccineName}`,
            dueDate: vaccination.nextDueDate.toISOString(),
            sendEmail: true,
            metadata: { vaccinationId: vaccination.id },
          });
        }
      }
    }

    // Generate medication reminders for active medications
    const medications = await this.medicationsService.findAll(userId, petId);
    for (const medication of medications.filter((m) => m.isActive)) {
      // Create daily reminders for active medications
      const existingReminder = await this.remindersRepository.findOne({
        where: {
          userId,
          petId,
          type: 'medication' as any,
          metadata: { medicationId: medication.id } as any,
        },
      });

      if (!existingReminder) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await this.create(userId, {
          petId,
          type: 'medication' as any,
          title: `Medication: ${medication.name}`,
          description: `Give ${medication.name} to ${pet.name}`,
          dueDate: tomorrow.toISOString(),
          sendEmail: true,
          metadata: { medicationId: medication.id },
        });
      }
    }
  }
}

