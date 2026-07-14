import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdsService } from './households.service';
import { HouseholdsController } from './households.controller';
import { Household } from './entities/household.entity';
import { HouseholdMember } from './entities/household-member.entity';
import { HouseholdFinancial } from './entities/household-financial.entity';
import { HealthCondition } from './entities/health-condition.entity';
import { HouseholdNeed } from './entities/household-need.entity';
import { ExternalAid } from './entities/external-aid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Household, 
    HouseholdMember, 
    HouseholdFinancial, 
    HealthCondition, 
    HouseholdNeed, 
    ExternalAid
  ])],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
})
export class HouseholdsModule {}
