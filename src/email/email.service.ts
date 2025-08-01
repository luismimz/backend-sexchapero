import { Injectable } from "@nestjs/common";  
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { TemplateService } from "./template/template.service";
//Inyectamos el TemplateSercice para poder consultar las plantillas de correo
// guardamos en la BBDD con su clave KEY
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(
    private readonly config: ConfigService,
    private readonly templateService: TemplateService,
    private readonly prisma: PrismaService, // Inyecta PrismaService si necesitas registrar logs de envío , 
    @InjectQueue('email') private readonly emailQueue: Queue, // Inyecta la cola de email para procesar envíos asíncronos
  ) {
    // transportador de nodemailer SMTP
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'), // Puedes cambiar esto según tu proveedor de correo
      port: this.config.get('SMTP_PORT') || 587, // Puerto por defecto para SMTP
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }
  /***
   * Envio de email generico con texto plano o HTML
   * @param to Dirección de correo del destinatario
   * @param subject Asunto del correo
   * @param text Texto plano del correo
   * @param html Texto HTML del correo (opcional)
   * @returns Promise<void> que se resuelve cuando el correo se envía correctamente
   * @throws Error si ocurre un error al enviar el correo
  */
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM'), // Dirección de correo del remitente
        to: to,
        subject: subject,
        text: text,
        html: html, // Puedes enviar texto plano o HTML
      });
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      throw new Error('Error al enviar el correo electrónico');
    }
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const appUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000'; // URL del frontend
    if (!appUrl) {
      throw new Error('FRONTEND_URL is not defined in the configuration');
    } 
    const magicLink = `${appUrl}/magic-login?token=${token}`;

    const mailOptions = {
      from: this.config.get('MAIL_FROM'),
      to: email,
      subject: 'Tu enlace mágico de acceso',
      html: `
        <p>Hola 👋</p>
        <p>Pulsa aquí para acceder sin contraseña:</p>
        <p><a href="${magicLink}">${magicLink}</a></p>
        <p>Este enlace expirará en unos minutos.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async sendTemplate(
    templateKey: string,
    options: {
      to: string;
      replacements: Record<string, string>;
      sentById?: number; // Id del usuario que envía (opcional, para registrar en BBDD)
      ip?: string; // IP del usuario que envía (opcional, para registrar en BBDD)
      type?: string; // Tipo de correo (opcional, para registrar en BBDD)
      userAgent?: string
      //subject?: string; // Asunto del correo (opcional, para registrar en BBDD
    }
  ): Promise<void> {
    const template = await this.templateService.findByKey(templateKey);
    if (!template) {
      throw new Error(`Template with key ${templateKey} not found`);
    }
    // reemplazams {{variables}} en el texto y el HTML
    const compiledText = this.replaceVariables(template.text || '', options.replacements);
    const compiledHtml = this.replaceVariables(template.html || '', options.replacements);
    let  status = 'ok';
    let errorMsg = '';
    // Si hay error al enviar, lo registramos
    try {'';
    // Envia el correo usando el transportador de nodemailer creado mas arriba
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM'),
        to: options.to,
        subject: template.subject,
        text: template.type !== 'html' ? compiledText : undefined,
        html: template.type !== 'text' ? compiledHtml : undefined, // Si el template es HTML, lo enviamos como HTML   
      });
    } catch (error) {
      console.error('Error al enviar el correo electrónico:', error);
      status = 'error';
      errorMsg = error.message || 'Error desconocido al enviar el correo';
    }
    //Guarda el log tras el envio (ok o error)
    await this.prisma.emailLog.create({
      data:{
        to: options.to,
        subject: template.subject,
        templateKey,
        sentById: options.sentById,
        status,
        errorMsg,
        ip: options.ip,
        userAgent: options.userAgent, // Si necesitas registrar el user agent
        html: options.type === 'critico' ? compiledHtml : null, // Guarda el HTML solo si es tipo 'critico'
        text: options.type === 'critico' ? compiledText : null, // Guarda el texto solo si es tipo 'critico'
        type: options.type || 'info', // Tipo de correo, por defecto 'normal'
      },
    });
    if (status === 'error') {
      throw new Error(`Error al enviar el correo: ${errorMsg}`);
    }
    console.log(`Correo enviado a ${options.to} usando la plantilla ${templateKey}`); 
  }

  private replaceVariables(template: string, replacements: Record<string, string>): string {
    let result = template;
    // Recorremos cada clave del objeto de reemplazo
    for (const key in replacements) {
      //creamos una expresion regular para buscar {{clave}} con o sin espacios
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      // Reemplazamos la clave por su valor en el texto
      result = result.replace(placeholder, replacements[key]);
    }
    return result;
  }
  async getLogs(
    where: any = {},
    limit: number = 30,
    offset: number = 0){
      return this.prisma.emailLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc', // Ordenamos por fecha de creación descendente
        },
        take: limit, // Límite de registros
        skip: offset, // Desplazamiento para paginación
        include: {
          sentBy: {
            select: {
              id: true,
              email: true,
              username: true, // Incluimos el nombre de usuario si es necesario
              role: true, // Incluimos el rol del usuario
            },
          }
    }
      });
    }
    //metodo para obtener una plantilla compilada
    async getCompiledTemplate(templateKey: string, replacements: Record<string, string>) {
      const template = await this.templateService.findByKey(templateKey);
      if (!template) {
        throw new Error(`Template with key ${templateKey} not found`);
      }
      // Reemplazamos las variables en el texto y el HTML de la plantilla
      const compiledText = this.replaceVariables(template.text || '', replacements);
      const compiledHtml = this.replaceVariables(template.html || '', replacements);
      return {
        subject: template.subject,
        text: compiledText,
        html: compiledHtml,
      };
    }
  // Enviar un correo a través de la cola de Bull
  async enqueueEmailJob(
    templateKey: string,
    options:{
      to: string;
      replacements: Record<string, string>;
      sentById?: number; // Id del usuario que envía (opcional, para registrar en BBDD)
      ip?: string; // IP del usuario que envía (opcional, para registrar en BBDD)
      userAgent?: string; // User agent del usuario que envía (opcional)
      type?: string; // Tipo de correo (opcional, para registrar en BBDD)
    }
  ){
    await this.emailQueue.add('send',{
      templateKey,
      ...options, // Desestructura las opciones para pasarlas al job  
    });
  }
  async getEmailLogById(id: number) {
    return this.prisma.emailLog.findUnique({
      where: { id },
    });
  }
}