import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(user.userId, createReminderDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('petId') petId?: string) {
    return this.remindersService.findAll(user.userId, petId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, user.userId, updateReminderDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.remindersService.remove(id, user.userId);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.remindersService.complete(id, user.userId);
  }
}

