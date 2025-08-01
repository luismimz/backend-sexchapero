import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
    // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de GlogalMenders')
    .setDescription('Documentación de la API de GlogalMenders')
    .setVersion('1.0')
    .addBearerAuth()//para autenticación con JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);// http://localhost:3001/api/docs
  await app.listen(process.env.PORT ?? 3001);
}


bootstrap();
