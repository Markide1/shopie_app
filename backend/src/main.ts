import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Configure request body limits
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Grand Customs API')
    .setDescription('E-Shop for Car Parts')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('cart', 'Shopping cart endpoints')
    .addTag('orders', 'Order management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(
    `API documentation is available at: http://localhost:3000/api/docs`,
  );
}

void bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
