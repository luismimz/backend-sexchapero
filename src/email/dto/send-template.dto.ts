import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsObject, IsOptional, IsString} from 'class-validator';  
// Este Data Transfer Object (DTO) se utiliza para enviar correos electrónicos con plantillas.
export class SendTemplateDto {
  @ApiProperty({
    example: 'usuario@email.com', 
    description: 'Correo electrónico del destinatario'
  })
  @IsString() // valida que el campo sea una cadena de texto
  @IsEmail() // valida que el campo sea un correo electrónico válido
  @IsNotEmpty() // no puede estar vacío
  to: string; //Destinatario del correo

  @ApiProperty({
    example: 'welcome_email',
    description: 'Clave de la plantilla que se va a usar'
  })
  @IsNotEmpty() // no puede estar vacío
  @IsString() // valida que el campo sea una cadena de texto
  @IsNotEmpty() // no puede estar vacío
  templateKey: string; //clave de la plantilla que se va a usar

  @ApiProperty({
    example: { name: 'Luis', age: 30, ciudad: 'Antigua'},
    description: 'Variables de la plantilla en formato JSON'
  })
  @IsOptional() // este campo es opcional
  @IsNotEmpty() // no puede estar vacío si se proporciona
  @IsObject() //Debe ser un objeto tipo JSON {nombre: 'Luis', ... }
  replacements: Record<string, string>; //reemplazos de la plantilla {{variables}}

  @ApiProperty({
    example: 'normal, critico, alerta',
    description: 'ID del usuario que envía el correo (opcional)'
  })
  @IsOptional() // este campo es opcional
  @IsString() // valida que el campo sea una cadena de texto
  sentById?: string; // ID del usuario que envía el correo (opcional)
  @IsString() // valida que el campo sea una cadena de texto
  type?: string; // tipo de correo (opcional, por defecto 'normal')

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    description: 'User agent del usuario que envía el correo (opcional)'
  })
  @IsOptional() // este campo es opcional
  @IsString() // valida que el campo sea una cadena de texto
  userAgent?: string; // user agent del usuario que envía el correo (opcional)
}