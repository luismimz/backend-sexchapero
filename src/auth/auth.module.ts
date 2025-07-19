import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async(configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),// ⚠️ Usa una variable de entorno real en producción
      signOptions: { expiresIn: '1h', algorithm: 'HS256' }, // Asegúrate de que el algoritmo coincida con tu configuración de JWT
    }),}),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy],
})
export class AuthModule {}
