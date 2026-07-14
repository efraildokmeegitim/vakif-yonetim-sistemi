import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonnelService } from './personnel.service';
import { PersonnelController } from './personnel.controller';
import { Personnel } from './entities/personnel.entity';
import { Payroll } from './entities/payroll.entity';
import { PersonnelLeave } from './entities/personnel-leave.entity';
import { PersonnelFile } from './entities/personnel-file.entity';
import { SystemPluginsModule } from '../system-plugins/system-plugins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personnel, Payroll, PersonnelLeave, PersonnelFile]),
    SystemPluginsModule,
  ],
  controllers: [PersonnelController],
  providers: [PersonnelService],
  exports: [PersonnelService],
})
export class PersonnelModule {}
