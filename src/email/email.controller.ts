import { Body, Controller, Post, Request, Get, Query, UseGuards } from '@nestjs/common'; 
import { EmailService } from './email.service';
import { SendTemplateDto } from './dto/send-template.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard'; 
import { AuthGuard } from '@nestjs/passport';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService,
              @InjectQueue('email') private readonly emailQueue: Queue // Inyectamos la cola de BullMQ para manejar los trabajos de envío de correos
  ) {}
  @ApiOperation({ summary: 'Ver estado de la cola de correos (pendientes, fallidos, completos, etc)' })
  @ApiResponse({ status: 200, description: 'Resumen del estado de la cola de emails' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Get('queue/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async getEmailQueueStatus() {
    // mostramos el estado de la cola de correos: pendientes, en proceso y completados
    return {
      waiting: await this.emailQueue.getWaitingCount(), // Correos pendientes
      active: await this.emailQueue.getActiveCount(), // Correos en proceso
      completed: await this.emailQueue.getCompletedCount(), // Correos completados
      failed: await this.emailQueue.getFailedCount(), // Correos fallidos
      delayed: await this.emailQueue.getDelayedCount(), // Correos retrasados
      paused: await this.emailQueue.isPaused(), // Si la cola está pausada
    };
  }
  /**
   * Ruta para enviar un correo electronico a partir de una plantilla
   * se usa la clave KEY de la plantilla y un objeto de reemplazo de variable
   */
  @ApiOperation({ summary: 'Enviar un correo electrónico usando una plantilla' })
  @ApiBody({ type: SendTemplateDto })
  @ApiResponse({ status: 201, description: 'Correo enviado correctamente' })
  @Post('send-template')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async sendTemplateEmail( @Request() req, @Body() body: SendTemplateDto) {
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
      //await this.emailService.sendTemplate(
      await this.emailService.enqueueEmailJob(
        body.templateKey, 
        {
          to: body.to, 
          replacements: body.replacements,
          sentById: req.user.userId, // ID del usuario que envía el correo
          ip: req.ip, // IP del usuario que envía el correo
          userAgent: body.userAgent || req.headers['user-agent'], // User agent del usuario que envía el correo
          type: body.type || 'critico', // Tipo de correo (opcional)
        }
      );
      // si el envio es exitoso, retornamos un mensaje de éxito
      return {
        success: true,
        message: 'Correo enviado correctamente',
      };
  }

  //Obtener los logs de correos electrónicos enviados
  @ApiOperation({ summary: 'Ver logs de los emails (paginados y filtrables)' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de correo (opcional)' })
  @ApiQuery({ name: 'to', required: false, description: 'Correo destinatario (opcional)' })
  @ApiQuery({ name: 'sentById', required: false, description: 'ID del usuario que envió (opcional)' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado del envío (opcional)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de registros', type: Number, example: 30 })
  @ApiQuery({ name: 'offset', required: false, description: 'Desplazamiento para paginación', type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de logs de correos electrónicos' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'No se encontraron logs de correos electrónicos' })
  @Get('logs')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async getEmailLogs(
    @Query('type') type?: string, // Tipo de correo (opcional)
    @Query('to') to?: string, // Correo destinatario (opcional)
    @Query('sentById') sentById?: number, // ID del usuario que envió (opcional)
    @Query('status') status?: string, // Estado del envío (opcional)
    @Query('limit') limit: number = 30, // Límite de registros
    @Query('offset') offset: number = 0 // Desplazamiento para paginacion
  ) {
    //filtros admitidos
    const where: any = {};
    if (type) where.type = type;
    if (to) where.to = to;
    if (sentById) where.sentById = Number(sentById);
    if (status) where.status = status;

    const logs = await this.emailService.getLogs(where, Number(limit), Number(offset));
    return logs;
  }

  //Reprocesar un correo electrónico fallido y/o modificar el destinatario
  @ApiOperation({ summary: 'Reprocesar un email enviado y fallido (reenviar/cambiar destinatario)' })
  @ApiBody({ schema: { properties: { id: { type: 'number' }, to: { type: 'string'} }}})
  @Post('reprocess')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async reprocessEmail(@Body() body: { id: number, to?: string }) {
    const { id, to } = body;
    if (!id) {
      return {
        success: false,
        message: 'Falta el ID del correo a reprocesar',
      };
    }
    // Obtenemos el log del correo electrónico por ID
    const emailLog = await this.emailService.getEmailLogById(id);
    if (!emailLog) {
      return {
        success: false,
        message: 'No se encontró el log del correo electrónico',
      };
    }
    // Parse replacements para asegurarnos de que sea un objeto
    let replacements: Record<string, any> = {};
    try {
      replacements = JSON.parse(emailLog.replacements || '{}');
    } catch  {
      console.error('Error parsing replacements:', emailLog.replacements);
      return {
        success: false,
        message: 'Error al procesar las replacements del log',
      };
    }

    if( !emailLog.templateKey) {
      return {
        success: false,
        message: 'No se encontró la plantilla asociada al log del correo electrónico',
      };
    }

    // Si se proporciona un nuevo destinatario, lo actualizamos
    const newTo = to || emailLog.to;
    // Enviamos el correo electrónico nuevamente usando el servicio de email
    await this.emailService.enqueueEmailJob(
      emailLog.templateKey, // Usamos la plantilla original
      {
        to: newTo,
        replacements, // Aseguramos que las replacements sean un objeto
        sentById: emailLog.sentById || undefined, // Mantenemos el ID del usuario que envió originalmente
        ip: emailLog.ip || undefined, // Mantenemos la IP del usuario que envió originalmente
        userAgent: emailLog.userAgent || undefined, // Mantenemos el user agent del usuario que envió originalmente
        type: emailLog.type || undefined, // Mantenemos el tipo de correo del log original
      }
    );
    return { 
      success: true,
      message: 'Correo reprocesado correctamente',
      to: newTo,
      logId: id,
    };
  }
  //Previsualizar las plantillas de correo
  @ApiOperation({ summary: 'Previsualizar una plantilla de correo electrónico' })
  @ApiBody({ type: SendTemplateDto })
  @ApiResponse({ status: 200, description: 'Plantilla de correo electrónico compilada correctamente' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('preview-template')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege la ruta con AuthGuard y RolesGuard
  @Roles('admin', 'moderator') // Solo usuarios con roles 'admin' o 'moderator' pueden acceder
  async previewTemplate(@Body() body: SendTemplateDto) {
    const { templateKey, replacements } = body;
    const template = await this.emailService.getCompiledTemplate(templateKey, replacements);
    return {
      Subject: template.subject,
      Html: template.html,
      Text: template.text,
    };
  }
}
