import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as firebaseAdmin from 'firebase-admin';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Authentication')
    .setDescription(
      'The API details for the Task Management Demo application using Firebase in the NestJS backend.',
    )
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // //firebase ;
  // const firebaseKeyFilePath =
  //   './user-authentication-94ddb-firebase-adminsdk-fym5l-92e09dab17.json';
  // const firebaseServiceAccount /*: ServiceAccount*/ = JSON.parse(
  //   fs.readFileSync(firebaseKeyFilePath).toString(),
  // );
  if (firebaseAdmin.apps.length === 0) {
    console.log('Initialize Firebase Application.');
    firebaseAdmin.initializeApp({
      // credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  await app.listen(process.env.PORT);
}
bootstrap();
