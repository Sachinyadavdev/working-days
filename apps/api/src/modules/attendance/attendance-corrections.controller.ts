import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceCorrectionsService } from './attendance-corrections.service';
import { CorrectionRequestDto } from './dto/correction-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance Corrections')
@ApiBearerAuth('access-token')
@Controller({ path: 'attendance/corrections', version: '1' })
export class AttendanceCorrectionsController {
  constructor(private readonly correctionsService: AttendanceCorrectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Request an attendance correction' })
  async requestCorrection(@CurrentUser('sub') userId: string, @Body() dto: CorrectionRequestDto) {
    return this.correctionsService.requestCorrection(userId, dto);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current employee correction requests' })
  async getMyRequests(@CurrentUser('sub') userId: string) {
    return this.correctionsService.getMyRequests(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all correction requests (Admin)' })
  async getAllRequests() {
    return this.correctionsService.getAllRequests();
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a correction request' })
  async approveRequest(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.correctionsService.approveRequest(userId, id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a correction request' })
  async rejectRequest(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.correctionsService.rejectRequest(userId, id);
  }
}
