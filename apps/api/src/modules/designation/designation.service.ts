import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Injectable()
export class DesignationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDesignationDto: CreateDesignationDto) {
    return this.prisma.designation.create({
      data: createDesignationDto,
    });
  }

  async findAll() {
    return this.prisma.designation.findMany({
      include: {
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!designation) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    return designation;
  }

  async update(id: string, updateDesignationDto: UpdateDesignationDto) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.designation.update({
      where: { id },
      data: updateDesignationDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure it exists

    return this.prisma.designation.delete({
      where: { id },
    });
  }
}
