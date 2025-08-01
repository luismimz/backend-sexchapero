import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";

export class CreateTemplateDto {
  @ApiProperty({ example: 'welcome_email', description: 'Clave única de la plantilla' })
  @IsString()
  @IsNotEmpty()
  key: string; // <-- cambia Key por key

  @ApiProperty({ example: 'Bienvenido a GlobalMenders', description: 'Asunto del email' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<h1>Hola {{name}}</h1>', description: 'Contenido HTML', required: false })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiProperty({ example: 'Hola {{name}}', description: 'Texto plano', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 'both', description: 'Tipo de plantilla: text, html, both' })
  @IsString()
  @IsIn(['text', 'html', 'both'])
  type: 'text' | 'html' | 'both';

  @ApiProperty({ example: 'Mozilla/5.0...', description: 'User agent del creador', required: false })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ example: '1', description: 'ID del usuario creador', required: false })
  @IsString()
  @IsOptional()
  createdById?: string;

  // (Opcional) Puedes añadir un array de variables soportadas solo para documentación/futuro panel
  @ApiProperty({
    example: ['name', 'ciudad'],
    description: 'Variables dinámicas aceptadas por la plantilla (solo doc, opcional)',
    required: false,
    type: [String],
  })
  @IsOptional()
  variables?: string[];
}
