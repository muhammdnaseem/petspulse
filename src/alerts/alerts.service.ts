import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertType, AlertSeverity, AlertStatus } from './entities/alert.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { PetsService } from '../pets/pets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VitalSignsService } from '../vital-signs/vital-signs.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
    @InjectRepository(AlertRule)
    private alertRulesRepository: Repository<AlertRule>,
    private petsService: PetsService,
    private notificationsService: NotificationsService,
    private vitalSignsService: VitalSignsService,
  ) {}

  async findAll(userId: string, petId?: string) {
    const where: any = { userId };
    if (petId) {
      where.petId = petId;
    }

    return this.alertsRepository.find({
      where,
      relations: ['pet'],
      order: { createdAt: 'DESC' },
    });
  }

  async createAlert(
    userId: string,
    petId: string,
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
  ) {
    const alert = this.alertsRepository.create({
      userId,
      petId,
      type,
      severity,
      title,
      message,
      status: AlertStatus.PENDING,
    });

    const savedAlert = await this.alertsRepository.save(alert);

    // Send notifications
    const pet = await this.petsService.findOne(petId, userId);
    // Note: User should be fetched from UsersService - this is a placeholder
    // In production, inject UsersService properly

    if (user.email) {
      await this.notificationsService.sendAlertEmail(
        user.email,
        title,
        message,
        pet.name,
      );
      savedAlert.emailSent = true;
    }

    if (user.phoneNumber) {
      await this.notificationsService.sendAlertSms(
        user.phoneNumber,
        `${title}: ${message}`,
      );
      savedAlert.smsSent = true;
    }

    await this.alertsRepository.save(savedAlert);
    return savedAlert;
  }

  async checkAlertRules(petId: string, userId: string) {
    const rules = await this.alertRulesRepository.find({
      where: { petId, isActive: true },
    });

    const latestVitalSign = (
      await this.vitalSignsService.findAll(userId, petId)
    )[0];

    if (!latestVitalSign) {
      return;
    }

    for (const rule of rules) {
      let shouldAlert = false;
      let message = '';

      switch (rule.type) {
        case 'temperature_high':
          if (
            latestVitalSign.temperature &&
            parseFloat(rule.thresholdValue) &&
            latestVitalSign.temperature > parseFloat(rule.thresholdValue)
          ) {
            shouldAlert = true;
            message = `Temperature is ${latestVitalSign.temperature}°${latestVitalSign.temperatureUnit}, above threshold of ${rule.thresholdValue}°`;
          }
          break;
        case 'temperature_low':
          if (
            latestVitalSign.temperature &&
            parseFloat(rule.thresholdValue) &&
            latestVitalSign.temperature < parseFloat(rule.thresholdValue)
          ) {
            shouldAlert = true;
            message = `Temperature is ${latestVitalSign.temperature}°${latestVitalSign.temperatureUnit}, below threshold of ${rule.thresholdValue}°`;
          }
          break;
        // Add more rule types as needed
      }

      if (shouldAlert) {
        await this.createAlert(
          userId,
          petId,
          AlertType.VITAL_SIGN,
          AlertSeverity.HIGH,
          'Vital Sign Alert',
          message,
        );
      }
    }
  }

  async createAlertRule(userId: string, createAlertRuleDto: CreateAlertRuleDto) {
    await this.petsService.findOne(createAlertRuleDto.petId, userId);

    const rule = this.alertRulesRepository.create(createAlertRuleDto);
    return this.alertRulesRepository.save(rule);
  }

  async findAllAlertRules(userId: string, petId?: string) {
    const where: any = {};
    if (petId) {
      where.petId = petId;
    }

    const rules = await this.alertRulesRepository.find({
      where,
      relations: ['pet'],
    });

    return rules.filter((rule) => rule.pet.ownerId === userId);
  }

  async updateAlertRule(
    id: string,
    userId: string,
    updateAlertRuleDto: UpdateAlertRuleDto,
  ) {
    const rule = await this.alertRulesRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!rule || rule.pet.ownerId !== userId) {
      throw new NotFoundException('Alert rule not found');
    }

    Object.assign(rule, updateAlertRuleDto);
    return this.alertRulesRepository.save(rule);
  }

  async removeAlertRule(id: string, userId: string) {
    const rule = await this.alertRulesRepository.findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!rule || rule.pet.ownerId !== userId) {
      throw new NotFoundException('Alert rule not found');
    }

    await this.alertRulesRepository.remove(rule);
  }
}

