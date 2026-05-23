import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  async logLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean) {
    return this.prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        userAgent,
        success,
      },
    });
  }

  async getRecentFailedAttempts(email: string, minutes: number) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return this.prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: { gte: since },
      },
    });
  }

  async recordDevice(userId: string, deviceId: string, ipAddress: string, userAgent: string) {
    const existing = await this.prisma.deviceHistory.findFirst({
      where: { userId, deviceId },
    });

    if (existing) {
      return this.prisma.deviceHistory.update({
        where: { id: existing.id },
        data: { lastActive: new Date(), ipAddress, userAgent },
      });
    }

    return this.prisma.deviceHistory.create({
      data: {
        userId,
        deviceId,
        ipAddress,
        userAgent,
      },
    });
  }

  async getDeviceHistory(userId: string) {
    return this.prisma.deviceHistory.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
    });
  }
}
