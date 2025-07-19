import { Injectable } from "@nestjs/common";  
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
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
}
