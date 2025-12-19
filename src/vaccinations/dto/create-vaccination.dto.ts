import {
  IsUUID,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateVaccinationDto {
  @IsUUID()
  petId: string;

  @IsString()
  vaccineName: string;

  @IsDateString()
  vaccinationDate: string;

  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsString()
  @IsOptional()
  clinic?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;
}

