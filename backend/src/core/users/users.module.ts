import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { ImportModule } from '../import/import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
    forwardRef(() => ImportModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // AuthModule için dışarı aktarıyoruz
})
export class UsersModule {}
