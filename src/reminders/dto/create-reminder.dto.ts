import {
  IsUUID,
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ReminderType } from '../entities/reminder.entity';

export class CreateReminderDto {
  @IsUUID()
  @IsOptional()
  petId?: string;

  @IsEnum(ReminderType)
  type: ReminderType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  sendSms?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}

