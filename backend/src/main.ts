import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SocketIoAdapter } from './ws/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ping Pong Documentation.')
    .setDescription('The ping pong description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-doc', app, document);

  const corsOptions = {
    credentials: true,
    origin: configService.getOrThrow('FRONTEND_ORIGIN'),
    optionsSuccessStatus: 200,
  } as CorsOptions;
  app.enableCors(Object.assign(corsOptions)); // nestjs updating the origin property
  app.useWebSocketAdapter(new SocketIoAdapter(app, corsOptions));

  app.setGlobalPrefix('/api'); 

  await app.listen(configService.getOrThrow('PORT'));

  // TODO: remove in production
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
