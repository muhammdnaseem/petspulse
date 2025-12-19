import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['pets'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getProfile(userId: string) {
    const user = await this.findOne(userId);
    const { password, resetPasswordToken, resetPasswordExpires, ...result } =
      user;
    return result;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(userId);

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    const { password, resetPasswordToken, resetPasswordExpires, ...result } =
      user;
    return result;
  }
}

