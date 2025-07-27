import { Controller, Query,  Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TemplateService } from './template.service';
import { Prisma } from '@prisma/client';

@Controller('email/templates') //base de la ruta: api/email/templates
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  create(@Body() data: Prisma.EmailTemplateCreateInput) {
    return this.templateService.create(data);
  }

  @Get()
  findAll(@Query() query: Prisma.EmailTemplateWhereInput) {
    return this.templateService.findAll(query); // ✅ usamos el servicio, no prisma directo
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.EmailTemplateUpdateInput) {
    return this.templateService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
