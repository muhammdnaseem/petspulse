import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

export enum AlertRuleType {
  TEMPERATURE_HIGH = 'temperature_high',
  TEMPERATURE_LOW = 'temperature_low',
  HEART_RATE_HIGH = 'heart_rate_high',
  HEART_RATE_LOW = 'heart_rate_low',
  RESPIRATORY_RATE_HIGH = 'respiratory_rate_high',
  RESPIRATORY_RATE_LOW = 'respiratory_rate_low',
  WEIGHT_CHANGE = 'weight_change',
  MEDICATION_DUE = 'medication_due',
  VACCINATION_DUE = 'vaccination_due',
  CUSTOM = 'custom',
}

export enum AlertRuleOperator {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  PERCENTAGE_CHANGE = 'percentage_change',
}

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.alertRules)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column({
    type: 'enum',
    enum: AlertRuleType,
  })
  type: AlertRuleType;

  @Column({ nullable: true })
  thresholdValue: string; // Can be number or percentage

  @Column({
    type: 'enum',
    enum: AlertRuleOperator,
    nullable: true,
  })
  operator: AlertRuleOperator;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  sendEmail: boolean;

  @Column({ default: false })
  sendSms: boolean;

  @Column({ type: 'text', nullable: true })
  customMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

