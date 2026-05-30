import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ResetPasswordDto, ChangeStatusDto } from './dto/admin-employee.dto';
import { APP_CONSTANTS } from '../../common/constants';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(pagination: PaginationDto) {
    const { skip, limit, search, sortBy, sortOrder } = pagination;

    const where = search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: 'insensitive' as const } },
            { department: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
            { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        include: {
          department: {
            select: { id: true, name: true },
          },
          designation: {
            select: { id: true, name: true },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              roles: {
                include: { role: true },
              },
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      items: employees,
      meta: {
        total,
        page: pagination.page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: pagination.page * limit < total,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async findById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true },
        },
        designation: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            roles: {
              include: { role: true },
            },
          },
        },
        teamMembers: {
          include: { team: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    const employee = await this.prisma.employee.create({
      data: {
        userId: dto.userId,
        employeeCode: dto.employeeCode,
        departmentId: dto.department,
        designationId: dto.designation,
        phone: dto.phone,
        dateOfJoining: new Date(dto.dateOfJoining),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        requiredDailyHours: dto.requiredDailyHours,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    this.eventEmitter.emit('employee.created', employee);
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        employeeCode: dto.employeeCode,
        departmentId: dto.department,
        designationId: dto.designation,
        phone: dto.phone,
        dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        requiredDailyHours: dto.requiredDailyHours !== undefined ? dto.requiredDailyHours : undefined,
      },
    });

    this.eventEmitter.emit('employee.updated', { before: existing, after: employee });
    return employee;
  }

  async createEmployeeAsAdmin(dto: AdminCreateEmployeeDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Generate random 8-char password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(temporaryPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
    
    // Generate Employee Code if not provided
    const employeeCode = dto.employeeCode || `EMP-${Date.now().toString().slice(-6)}`;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        forcePasswordReset: true,
        employee: {
          create: {
            employeeCode,
            departmentId: dto.departmentId || null,
            designationId: dto.designationId || null,
            phone: dto.phone || null,
            gender: dto.gender || null,
            address: dto.address || null,
            employeeType: dto.employeeType || 'FULL_TIME',
            workLocation: dto.workLocation || null,
            bloodGroup: dto.bloodGroup || null,
            emergencyContact: dto.emergencyContact || null,
            dateOfJoining: new Date(dto.dateOfJoining),
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            requiredDailyHours: dto.requiredDailyHours !== undefined ? dto.requiredDailyHours : 8.0,
          },
        },
        roles: {
          create: dto.roles.map((roleName) => ({
            role: {
              connectOrCreate: {
                where: { name: roleName },
                create: { name: roleName, description: `${roleName} role` },
              },
            },
          })),
        },
      },
      include: {
        employee: true,
        roles: {
          include: { role: true },
        },
      },
    });

    this.logger.log(`Created new employee via Admin. Email: ${dto.email}, Temp Password: ${temporaryPassword}`);
    
    return {
      user: { id: user.id, email: user.email },
      employee: user.employee,
      roles: user.roles.map(r => r.role.name),
      temporaryPassword, // Ideally, don't return this, send via email. Returned here for demonstration.
    };
  }

  async updateEmployeeAsAdmin(id: string, dto: AdminUpdateEmployeeDto) {
    const employee = await this.findById(id);

    // Update User
    if (dto.firstName || dto.lastName || dto.email) {
      if (dto.email && dto.email !== employee.user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });
        if (existingUser) {
          throw new ConflictException('A user with this email already exists');
        }
      }
      
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
        },
      });
    }

    // Update Employee
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        departmentId: dto.departmentId !== undefined ? dto.departmentId : undefined,
        designationId: dto.designationId !== undefined ? dto.designationId : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        gender: dto.gender !== undefined ? dto.gender : undefined,
        address: dto.address !== undefined ? dto.address : undefined,
        employeeType: dto.employeeType !== undefined ? dto.employeeType : undefined,
        employeeCode: dto.employeeCode !== undefined ? dto.employeeCode : undefined,
        workLocation: dto.workLocation !== undefined ? dto.workLocation : undefined,
        bloodGroup: dto.bloodGroup !== undefined ? dto.bloodGroup : undefined,
        emergencyContact: dto.emergencyContact !== undefined ? dto.emergencyContact : undefined,
        dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        requiredDailyHours: dto.requiredDailyHours !== undefined ? dto.requiredDailyHours : undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        department: true,
      },
    });

    // Update Roles if provided
    if (dto.roles) {
      await this.changeRole(id, { roles: dto.roles });
    }

    this.logger.log(`Updated employee via Admin. Employee ID: ${id}`);
    
    return updatedEmployee;
  }

  async changeStatus(id: string, dto: ChangeStatusDto) {
    const employee = await this.findById(id);
    const updated = await this.prisma.employee.update({
      where: { id },
      data: { status: dto.status },
      include: { user: true },
    });
    
    // Also update User isActive based on Employee Status
    await this.prisma.user.update({
      where: { id: employee.userId },
      data: { isActive: dto.status === 'ACTIVE' },
    });
    
    return updated;
  }

  async resetPasswordAsAdmin(id: string, dto: ResetPasswordDto) {
    const employee = await this.findById(id);
    const newPassword = dto.newPassword || Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(newPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: employee.userId },
      data: { 
        passwordHash,
        forcePasswordReset: true 
      },
    });

    // Revoke tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: employee.userId },
    });

    this.logger.log(`Admin reset password for user: ${employee.user.email}. New Temp Password: ${newPassword}`);
    
    return { message: 'Password reset successful', temporaryPassword: newPassword };
  }

  async changeRole(id: string, dto: ChangeRoleDto) {
    const employee = await this.findById(id);
    
    // Clear existing roles
    await this.prisma.userRole.deleteMany({
      where: { userId: employee.userId },
    });

    // Add new roles
    const updatedUser = await this.prisma.user.update({
      where: { id: employee.userId },
      data: {
        roles: {
          create: dto.roles.map((roleName) => ({
            role: {
              connectOrCreate: {
                where: { name: roleName },
                create: { name: roleName, description: `${roleName} role` },
              },
            },
          })),
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });

    return { roles: updatedUser.roles.map(r => r.role.name) };
  }
}
