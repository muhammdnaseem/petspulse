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

@Entity('vaccinations')
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.vaccinations)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column()
  vaccineName: string;

  @Column({ type: 'date' })
  vaccinationDate: Date;

  @Column({ type: 'date', nullable: true })
  nextDueDate: Date;

  @Column({ nullable: true })
  veterinarian: string;

  @Column({ nullable: true })
  clinic: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  batchNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

