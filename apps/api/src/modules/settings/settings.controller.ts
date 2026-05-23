import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get all public system settings' })
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all system settings (Super Admin)' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Get(':key')
  @ApiOperation({ summary: 'Get a specific system setting by key (Super Admin)' })
  getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @ApiBearerAuth()
  @Roles('SUPER_ADMIN')
  @Put(':key')
  @ApiOperation({ summary: 'Create or update a system setting (Super Admin)' })
  upsertSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.settingsService.upsertSetting(key, dto, userId);
  }
}
