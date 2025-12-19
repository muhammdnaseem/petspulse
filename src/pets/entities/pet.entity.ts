import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HealthEntry } from '../../health-entries/entities/health-entry.entity';
import { VitalSign } from '../../vital-signs/entities/vital-sign.entity';
import { Medication } from '../../medications/entities/medication.entity';
import { Vaccination } from '../../vaccinations/entities/vaccination.entity';
import { AlertRule } from '../../alerts/entities/alert-rule.entity';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  FISH = 'fish',
  REPTILE = 'reptile',
  OTHER = 'other',
}

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PetSpecies,
  })
  species: PetSpecies;

  @Column({ nullable: true })
  breed: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  weightUnit: string; // kg, lbs

  @Column({ type: 'text', nullable: true })
  medicalHistory: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  microchipNumber: string;

  @ManyToOne(() => User, (user) => user.pets)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => HealthEntry, (entry) => entry.pet)
  healthEntries: HealthEntry[];

  @OneToMany(() => VitalSign, (vital) => vital.pet)
  vitalSigns: VitalSign[];

  @OneToMany(() => Medication, (medication) => medication.pet)
  medications: Medication[];

  @OneToMany(() => Vaccination, (vaccination) => vaccination.pet)
  vaccinations: Vaccination[];

  @OneToMany(() => AlertRule, (rule) => rule.pet)
  alertRules: AlertRule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

