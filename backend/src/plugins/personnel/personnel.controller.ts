import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { PluginGuard } from '../system-plugins/plugin.guard';

@UseGuards(JwtAuthGuard, PluginGuard)
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post()
  create(@Body() createPersonnelDto: any) {
    return this.personnelService.create(createPersonnelDto);
  }

  @Get()
  findAll() {
    return this.personnelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonnelDto: any) {
    return this.personnelService.update(+id, updatePersonnelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personnelService.remove(+id);
  }

  // --- Payroll ---
  @Get(':id/payrolls')
  getPayrolls(@Param('id') id: string) {
    return this.personnelService.getPayrolls(+id);
  }
  @Post(':id/payrolls')
  addPayroll(@Param('id') id: string, @Body() data: any) {
    return this.personnelService.addPayroll(+id, data);
  }
  @Delete(':id/payrolls/:payrollId')
  removePayroll(@Param('id') id: string, @Param('payrollId') payrollId: string) {
    return this.personnelService.removePayroll(+payrollId);
  }

  // --- Leaves ---
  @Get(':id/leaves')
  getLeaves(@Param('id') id: string) {
    return this.personnelService.getLeaves(+id);
  }
  @Post(':id/leaves')
  addLeave(@Param('id') id: string, @Body() data: any) {
    return this.personnelService.addLeave(+id, data);
  }
  @Delete(':id/leaves/:leaveId')
  removeLeave(@Param('id') id: string, @Param('leaveId') leaveId: string) {
    return this.personnelService.removeLeave(+leaveId);
  }

  // --- Files ---
  @Get(':id/files')
  getFiles(@Param('id') id: string) {
    return this.personnelService.getFiles(+id);
  }
  @Post(':id/files')
  addFile(@Param('id') id: string, @Body() data: any) {
    return this.personnelService.addFile(+id, data);
  }
  @Delete(':id/files/:fileId')
  removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.personnelService.removeFile(+fileId);
  }
}
