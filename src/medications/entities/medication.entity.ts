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

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.medications)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  dosage: string;

  @Column({ nullable: true })
  frequency: string; // e.g., "twice daily", "every 8 hours"

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ nullable: true })
  prescribedBy: string; // Vet name

  @Column({ type: 'text', nullable: true })
  sideEffects: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

