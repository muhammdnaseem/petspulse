import {
  IsUUID,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { AlertRuleType, AlertRuleOperator } from '../entities/alert-rule.entity';

export class CreateAlertRuleDto {
  @IsUUID()
  petId: string;

  @IsEnum(AlertRuleType)
  type: AlertRuleType;

  @IsString()
  @IsOptional()
  thresholdValue?: string;

  @IsEnum(AlertRuleOperator)
  @IsOptional()
  operator?: AlertRuleOperator;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  sendSms?: boolean;

  @IsString()
  @IsOptional()
  customMessage?: string;
}

