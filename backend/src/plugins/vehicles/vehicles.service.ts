import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleMaintenance } from './entities/vehicle-maintenance.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleMaintenance) private maintRepo: Repository<VehicleMaintenance>,
  ) {}

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehicleRepo.create(createVehicleDto);
    return this.vehicleRepo.save(vehicle);
  }

  findAll() {
    return this.vehicleRepo.find({ order: { plate_number: 'ASC' } });
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: { maintenances: true },
    });
    if (!vehicle) throw new NotFoundException('Araç bulunamadı');
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    await this.vehicleRepo.update(id, updateVehicleDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.vehicleRepo.delete(id);
    return { success: true };
  }

  // --- Maintenances ---
  async addMaintenance(vehicleId: number, data: any) {
    const maint = this.maintRepo.create({ ...data, vehicleId });
    return this.maintRepo.save(maint);
  }

  async removeMaintenance(id: number) {
    return this.maintRepo.delete(id);
  }
}
