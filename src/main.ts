import { type NestApplication, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization",
  });

  // --- swagger 설정 ---
  const config = new DocumentBuilder()
    .setTitle("Intra Flow API")
    .setDescription("인트라 플로우 API 설명서")
    .setVersion("v_1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("docs", app, document);

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
