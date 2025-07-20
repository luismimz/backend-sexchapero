import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from '../config/config.schema';
import { PluginsModule } from './plugins/plugins.module';
import { PluginsController } from './plugins/plugins.controller';
import { ProfilesModule } from './profiles/profiles.module';
import { GalleryModule } from './gallery/gallery.module';
import { PaymentsModule } from './payments/payments.module';
import { FieldsModule } from './fields/fields.module';
import { TicketsModule } from './tickets/tickets.module';
import { PublicModule } from './public/public.module';
@Module({
  imports: [PluginsModule, ConfigModule.forRoot(
    {
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
      validationSchema:configValidationSchema, //join configValidationSchema
    }
  ),PrismaModule, UserModule, AuthModule, PluginsModule, ProfilesModule, GalleryModule, PaymentsModule, FieldsModule, TicketsModule, PublicModule],
  controllers: [AppController, PluginsController],
  providers: [AppService],
})
export class AppModule {}
