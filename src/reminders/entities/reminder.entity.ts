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
import { User } from '../../users/entities/user.entity';

export enum ReminderType {
  VACCINATION = 'vaccination',
  MEDICATION = 'medication',
  CHECKUP = 'checkup',
  HEALTH_CHECK = 'health_check',
  CUSTOM = 'custom',
}

export enum ReminderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column({ nullable: true })
  petId: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
  })
  type: ReminderType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ default: true })
  sendEmail: boolean;

  @Column({ default: false })
  sendSms: boolean;

  @Column({ type: 'int', default: 0 })
  reminderCount: number; // How many times reminder was sent

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // For storing related entity IDs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

