import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { employeeIds, ...data } = createDepartmentDto;
    
    return this.prisma.department.create({
      data: {
        ...data,
        ...(employeeIds && employeeIds.length > 0 && {
          employees: {
            connect: employeeIds.map(id => ({ id })),
          },
        }),
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        manager: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        employees: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        manager: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        employees: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id); // Ensure it exists

    const { employeeIds, ...data } = updateDepartmentDto;

    return this.prisma.department.update({
      where: { id },
      data: {
        ...data,
        ...(employeeIds && {
          employees: {
            set: employeeIds.map(empId => ({ id: empId })),
          },
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
