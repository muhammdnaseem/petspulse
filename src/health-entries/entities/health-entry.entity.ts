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

export enum HealthEntryType {
  GENERAL = 'general',
  SYMPTOM = 'symptom',
  INJURY = 'injury',
  BEHAVIOR = 'behavior',
  OTHER = 'other',
}

@Entity('health_entries')
export class HealthEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.healthEntries)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column({
    type: 'enum',
    enum: HealthEntryType,
    default: HealthEntryType.GENERAL,
  })
  type: HealthEntryType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'float', nullable: true })
  activityLevel: number; // 1-10 scale

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

