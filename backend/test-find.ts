import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/core/users/users.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const user = await usersService.findByEmail('admin@vakif.com');
  console.log("USER ROLE OBJECT:", JSON.stringify(user?.roleObject, null, 2));
  await app.close();
}
run();
