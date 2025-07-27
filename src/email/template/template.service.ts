import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, EmailType } from '@prisma/client';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EmailTemplateCreateInput) {
    return this.prisma.emailTemplate.create({ data });
  }
  findAll(where?: Prisma.EmailTemplateWhereInput) {
    return this.prisma.emailTemplate.findMany({where});
  }
  findOne(id: string) {
    return this.prisma.emailTemplate.findUnique({ where: { id } });
  }
  findByKey(key: string) {
    return this.prisma.emailTemplate.findUnique({ where: { key } });
  }
  async update(id: string, data: Prisma.EmailTemplateUpdateInput){
    const exits = await this.prisma.emailTemplate.findUnique({ where:{id}}); 
    if (!exits) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    }); 
  }
  async remove(id: string) {
    const exits = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!exits) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
    return this.prisma.emailTemplate.delete({ where: { id } });
  }
}