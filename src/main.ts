import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    cors: true,
  });

  // --- swagger 설정 ---
  const config = new DocumentBuilder()
    .setTitle('Intra Flow API')
    .setDescription('인트라 플로우 API 설명서')
    .setVersion('v_1.0')
    // .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8000);
  app.use(cookieParser());
}
bootstrap();
