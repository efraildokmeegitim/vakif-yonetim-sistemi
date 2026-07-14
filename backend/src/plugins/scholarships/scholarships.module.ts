import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { Scholarship } from './entities/scholarship.entity';
import { ScholarshipPayment } from './entities/scholarship-payment.entity';
import { ScholarshipAccrual } from './entities/scholarship-accrual.entity';
import { StudentDetails } from './entities/student-details.entity';
import { StudentFamilyInfo } from './entities/student-family-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Scholarship, 
    ScholarshipPayment, 
    ScholarshipAccrual,
    StudentDetails,
    StudentFamilyInfo
  ])],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService],
  exports: [ScholarshipsService]
})
export class ScholarshipsModule {}
