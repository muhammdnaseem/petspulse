import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pet } from '../../pets/entities/pet.entity';

@Entity('vital_signs')
@Index(['petId', 'recordedAt'])
export class VitalSign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.vitalSigns)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column({ type: 'float', nullable: true })
  temperature: number; // Fahrenheit or Celsius

  @Column({ nullable: true })
  temperatureUnit: string; // F or C

  @Column({ type: 'int', nullable: true })
  heartRate: number; // beats per minute

  @Column({ type: 'int', nullable: true })
  respiratoryRate: number; // breaths per minute

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  weightUnit: string; // kg or lbs

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

