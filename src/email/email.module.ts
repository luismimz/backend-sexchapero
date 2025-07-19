import  { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Importa ConfigModule para acceder a las variables de entorno
  providers: [EmailService],
  exports: [EmailService], // Exporta EmailService para que pueda ser utilizado en otros módulos  
})
export class EmailModule {}