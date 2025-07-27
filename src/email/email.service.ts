import { Injectable } from "@nestjs/common";  
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { from } from "rxjs";
import { TemplateService } from "./template/template.service";
//Inyectamos el TemplateSercice para poder consultar las plantillas de correo
// guardamos en la BBDD con su clave KEY
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(
    private readonly config: ConfigService,
    private readonly templateService: TemplateService
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
    }
  ): Promise<void> {
    const template = await this.templateService.findByKey(templateKey);
    if (!template) {
      throw new Error(`Template with key ${templateKey} not found`);
    }
    // reemplazams {{variables}} en el texto y el HTML
    const compiledText = this.replaceVariables(template.text || '', options.replacements);
    const compiledHtml = this.replaceVariables(template.html || '', options.replacements);
  // Envia el correo usando el transportador de nodemailer creado mas arriba
    await this.transporter.sendMail({
      from: this.config.get('MAIL_FROM'),
      to: options.to,
      subject: template.subject,
      text: template.type !== 'html' ? compiledText : undefined ,
      html: template.type !== 'text' ? compiledHtml : undefined, // Si el template es HTML, lo enviamos como HTML   
    });
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
}