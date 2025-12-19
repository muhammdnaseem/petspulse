import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { HealthEntryType } from '../entities/health-entry.entity';

export class CreateHealthEntryDto {
  @IsUUID()
  petId: string;

  @IsEnum(HealthEntryType)
  @IsOptional()
  type?: HealthEntryType;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  activityLevel?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @IsDateString()
  @IsOptional()
  entryDate?: string;
}

