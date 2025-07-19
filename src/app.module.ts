import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from '../config/config.schema';
@Module({
  imports: [ConfigModule.forRoot(
    {
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
      validationSchema:configValidationSchema, //join configValidationSchema
    }
  ),PrismaModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
