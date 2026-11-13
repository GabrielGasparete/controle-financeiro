import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Valida automaticamente o corpo das requisições com base nos DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Serve o front-end estático (HTML, CSS e JS) da pasta src/public
  // (o nest-cli.json copia essa pasta para dist/public durante o build)
  app.useStaticAssets(join(__dirname, 'public'));

  const porta = process.env.PORT ?? 3000;
  await app.listen(porta);
  console.log(`Aplicação rodando em http://localhost:${porta}`);
}
bootstrap();
