import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentAccountsService } from './current-accounts.service';
import { CurrentAccountsController } from './current-accounts.controller';
import { CurrentAccount } from './entities/current-account.entity';
import { CurrentAccountType } from './entities/current-account-type.entity';
import { CurrentAccountTypesController } from './current-account-types.controller';
import { CurrentAccountDocument } from './entities/current-account-document.entity';
import { AidLimit } from './entities/aid-limit.entity';
import { SystemPluginsModule } from '../system-plugins/system-plugins.module';
import { ImportModule } from '../../core/import/import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurrentAccount, CurrentAccountType, CurrentAccountDocument, AidLimit]),
    SystemPluginsModule,
    ImportModule
  ],
  controllers: [CurrentAccountsController, CurrentAccountTypesController],
  providers: [CurrentAccountsService],
  exports: [CurrentAccountsService],
})
export class CurrentAccountsModule {}
