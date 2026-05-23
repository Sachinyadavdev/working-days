import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmployeeProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        documents: true,
        reportingManager: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    return employee;
  }

  async updateProfile(userId: string, data: any) {
    const employee = await this.prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.employee.update({
      where: { id: employee.id },
      data,
    });
  }

  async getAllEmployees() {
    return this.prisma.employee.findMany({
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          }
        },
        department: true, 
        designation: true 
      },
    });
  }
  
  async createEmployee(data: any) {
    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;

    // Create User and Employee in transaction
    const result = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        roles: {
          create: {
            role: {
              connect: { name: 'EMPLOYEE' }
            }
          }
        },
        employee: {
          create: {
            employeeCode,
            phone: data.phone,
            departmentId: data.departmentId,
            designationId: data.designationId,
            dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : new Date(),
          }
        }
      },
      include: {
        employee: true,
      }
    });
    
    // In a real app, send tempPassword to user via email
    console.log(`[DEV ONLY] Created employee ${data.email} with password: ${tempPassword}`);
    return result;
  }
}
