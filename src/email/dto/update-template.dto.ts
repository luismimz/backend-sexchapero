import { ApiPropertyOptional} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// ActualizarTemplateDto se utiliza para actualizar una plantilla de correo electrónico existente
export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Bienvenido Actualizado', description: 'Nuevo asunto del email' })
  @IsString()
  @IsOptional()
  subject? : string; // Asunto del email

  @ApiPropertyOptional({ example: '<h1>Hola {{name}} Actualizado</h1>', description: 'Nuevo contenido HTML' })
  @IsString()
  @IsOptional()
  html?: string; // Contenido HTML de la plantilla

  @ApiPropertyOptional({ example: 'Hola {{name}} Actualizado', description: 'Nuevo texto plano' })
  @IsString()
  @IsOptional()
  text?: string; // Texto plano de la plantilla

  @ApiPropertyOptional({ example: 'both', description: 'Tipo de plantilla: text, html, both' })
  @IsString()
  @IsOptional()
  type? : 'text' | 'html' | 'both'; // Tipo de plantilla

  @ApiPropertyOptional({ example: 'Mozilla/5.0...', description: 'User agent del actualizador' })
  @IsString()
  @IsOptional()
  userAgent?: string; // User agent del usuario que actualiza la plantilla

  @ApiPropertyOptional({ example: '1', description: 'ID del usuario actualizador' })
  @IsString()
  @IsOptional()
  updatedById?: string; // ID del usuario que actualiza la plantilla

  // (Opcional) Puedes añadir un array de variables soportadas solo para documentación/futuro panel
  @ApiPropertyOptional({
    example: ['name', 'ciudad'],
    description: 'Variables dinámicas aceptadas por la plantilla (solo doc, opcional)',
    required: false,
    type: [String],
  })
  @IsOptional()
  variables?: string[]; // Variables dinámicas aceptadas por la plantilla
}
