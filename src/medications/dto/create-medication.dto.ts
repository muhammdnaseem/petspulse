import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateMedicationDto {
  @IsUUID()
  petId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  prescribedBy?: string;

  @IsString()
  @IsOptional()
  sideEffects?: string;
}

