import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceShiftsService } from './attendance-shifts.service';

@ApiTags('Attendance Shifts')
@ApiBearerAuth('access-token')
@Controller({ path: 'attendance/shifts', version: '1' })
export class AttendanceShiftsController {
  constructor(private readonly shiftsService: AttendanceShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift' })
  async createShift(@Body() dto: any) {
    return this.shiftsService.createShift(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shifts' })
  async getAllShifts() {
    return this.shiftsService.getAllShifts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift by id' })
  async getShiftById(@Param('id') id: string) {
    return this.shiftsService.getShiftById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shift' })
  async updateShift(@Param('id') id: string, @Body() dto: any) {
    return this.shiftsService.updateShift(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shift' })
  async deleteShift(@Param('id') id: string) {
    return this.shiftsService.deleteShift(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign shift to employee' })
  async assignShift(@Body() dto: { employeeId: string, shiftId: string }) {
    return this.shiftsService.assignShiftToEmployee(dto.employeeId, dto.shiftId);
  }
}
