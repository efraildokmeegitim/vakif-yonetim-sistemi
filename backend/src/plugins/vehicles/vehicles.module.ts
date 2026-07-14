import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleMaintenance } from './entities/vehicle-maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleMaintenance])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
