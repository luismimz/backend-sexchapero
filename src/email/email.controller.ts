import { Body, Controller, Post, Request } from '@nestjs/common'; 
import { EmailService } from './email.service';
import { SendTemplateDto } from './dto/send-template.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard'; 
import { AuthGuard } from '@nestjs/passport';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  /**
   * Ruta para enviar un correo electronico a partir de una plantilla
   * se usa la clave KEY de la plantilla y un objeto de reemplazo de variable
   */
  @Post('send-template')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async sendTemplateEmail(@Request() req, @Body() body: SendTemplateDto) {
    console.log('User:', req.user); // Log del usuario autenticado
    // Aqui nest valida el body automaticamente con el DTO SendTemplateDto
    // Si no se cumplen las validaciones, lanzará un error 400 automáticamente
    // Si se cumplen las validaciones, se ejecuta el código de abajo
    
    //extraemos los datos validados del body y llamamos al servicio de email
    //para enviar el correo electrónico
    const { templateKey, to, replacements } = body;
    if (!templateKey || !to || !replacements) {
      return {
        success: false, 
        message: 'Faltan datos: se requiere templateKey, to y replacements',
      };
      }
      await this.emailService.sendTemplate(
        body.templateKey, 
        {
          to: body.to, 
          replacements: body.replacements
        }
      );
      // si el envio es exitoso, retornamos un mensaje de éxito
      return {
        success: true,
        message: 'Correo enviado correctamente',
      };
  }
}
