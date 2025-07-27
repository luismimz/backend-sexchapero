import {IsEmail, IsNotEmpty, IsObject, IsString} from 'class-validator';  
// Este Data Transfer Object (DTO) se utiliza para enviar correos electrónicos con plantillas.
export class SendTemplateDto {
  @IsEmail() // valida que el campo sea un correo electrónico válido
  @IsNotEmpty() // no puede estar vacío
  to: string; //Destinatario del correo

  @IsString() // valida que el campo sea una cadena de texto
  @IsNotEmpty() // no puede estar vacío
  templateKey: string; //clave de la plantilla que se va a usar

  @IsObject() //Debe ser un objeto tipo JSON {nombre: 'Luis', ... }
  replacements: Record<string, string>; //reemplazos de la plantilla {{variables}}
}