import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Configuración de CORS
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
 // Permitir todas las solicitudes CORS
    Credentials: true, // Permitir credenciales
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
