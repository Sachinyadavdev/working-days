import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getPublicSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: { isPublic: true },
    });
    
    // Transform to key-value pairs
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);
  }

  async getAllSettings() {
    return this.prisma.systemSetting.findMany();
  }

  async getSettingByKey(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async upsertSetting(key: string, dto: UpdateSettingDto, updatedBy: string) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: dto.value,
        description: dto.description,
        isPublic: dto.isPublic,
        updatedBy,
      },
      create: {
        key,
        value: dto.value,
        description: dto.description,
        isPublic: dto.isPublic || false,
        updatedBy,
      },
    });

    this.logger.log(`System setting ${key} updated by ${updatedBy}`, 'SettingsService');

    return setting;
  }
}
