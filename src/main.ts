import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    cors: true,
  });
  await app.listen(process.env.PORT ?? 8000);
  app.use(cookieParser());
}
bootstrap();
