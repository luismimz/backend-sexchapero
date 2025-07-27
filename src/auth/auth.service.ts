import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, // Inyecta EmailService si es necesario
  ) {}
  async sendMagicLink(email: string) {
      const user = await this.prisma.user.findUnique({
        where: { email },
      })
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      const token = this.jwtService.sign(
        { sub: user.id, email: user.email},
        { 
          secret: process.env.JWT_SECRET,
          expiresIn: '15m' 
        },
      );
      await this.emailService.sendMagicLink(email, token);
      return { message: 'Enlace mágico al correo electrónico' };
  };
  async validateUser(identifier: string, password: string) {
    console.log('Validando usuario con identificador:', identifier);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
    console.log('Usuario encontrado:', user? user.id : null);
  if (!user) {
    console.log('Usuario no encontrado');
    throw new UnauthorizedException('Usuario no encontrado');
  }
const isPasswordValid = await bcrypt.compare(password, user.password);
console.log('Contraseña válida:', isPasswordValid);
  if (!isPasswordValid) {
    console.log('Contraseña incorrecta');
    throw new UnauthorizedException('Contraseña incorrecta');
  }
    return user;
  }

// Método 2: login con JWT (o por ahora simple)
async login(user: any) {
  console.log('Iniciando sesión para el usuario:', user.email);
  const payload = { sub: user.id, email: user.email};
  const token = await this.jwtService.signAsync(payload, {
    expiresIn: '1h', // Puedes ajustar el tiempo de expiración según tus necesidades   
  algorithm: 'HS256', // Asegúrate de que el algoritmo coincida con tu configuración de JWT 
  });
  console.log('Token generado:', token);
  // Devuelve el token y los datos del usuario
  console.log('Login exitoso para el usuario:', user.email);
  console.log('Datos del usuario:', {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role, // Asegúrate de que el modelo de usuario tenga un campo 'role' 
  });
  // Aquí puedes devolver el token y los datos del usuario

  return {
    message: 'Login correcto',
    access: token, 
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role : user.role, // Asegúrate de que el modelo de usuario tenga un campo 'role'
    },
  };}
  async loginWithMagicLink(token: string) {
    try {
      console.log('Iniciando sesión con enlace mágico, token:', token);
      // Verifica el token JWT
      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }
      // Verifica el token y extrae el payload  
      const payload = this.jwtService.verify(token);
      console.log('Payload del token:', payload);
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token inválido');
      }
      // Busca al usuario por el email del payload
      console.log('Buscando usuario con email:', payload.email); 
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      //si todo es correcto, devuelve el usuario
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '15m', algorithm: 'HS256' }, // Asegúrate de que el algoritmo coincida con tu configuración de JWT
      );
      return {
        message: 'Login exitoso con enlace mágico',
        access: accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      }
    } catch (error) {
      console.error('Error al iniciar sesión con enlace mágico:', error);
      // Maneja el error de verificación del token
      if (error instanceof UnauthorizedException) {
        throw error; // Re-lanza la excepción si ya es UnauthorizedException
      }
      // Si el token es inválido o ha expirado, lanza UnauthorizedException
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}