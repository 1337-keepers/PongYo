import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ id }, { login: id }],
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async getUsersContainingValue(value: string): Promise<User[]> {
    if (!value || value === '') return [];
    const users = await this.prismaService.user.findMany({
      where: {
        login: {
          contains: value,
        },
      },
    });
    if (!users) return [];
    return users;
  }
}