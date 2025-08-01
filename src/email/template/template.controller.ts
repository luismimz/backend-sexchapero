import { Controller, Query, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { EmailType } from '@prisma/client'; // importa el enum de Prisma

@ApiTags('Plantillas de Email')
@ApiBearerAuth()
@Controller('email/templates')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Protege TODOS los endpoints del controller
@Roles('admin', 'moderator')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiOperation({ summary: 'Crear una nueva plantilla de correo electrónico' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Plantilla creada.' })
  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.templateService.create(dto);
  }

  @ApiOperation({ summary: 'Listar todas las plantillas de email' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo (text, html, both)' })
  @ApiResponse({ status: 200, description: 'Lista de plantillas.' })
  @Get()
  findAll(@Query('type') type?: string) {
    const where = type ? { type: type as EmailType } : undefined;
    return this.templateService.findAll(where);
  }

  @ApiOperation({ summary: 'Ver detalles de una plantilla de email' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiResponse({ status: 200, description: 'Detalle de la plantilla.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar una plantilla de email' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Plantilla actualizada.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templateService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar una plantilla de email' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla' })
  @ApiResponse({ status: 200, description: 'Plantilla eliminada.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
