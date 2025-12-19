import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder } from './entities/reminder.entity';
import { PetsModule } from '../pets/pets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VaccinationsModule } from '../vaccinations/vaccinations.module';
import { MedicationsModule } from '../medications/medications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
    PetsModule,
    NotificationsModule,
    VaccinationsModule,
    MedicationsModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}

