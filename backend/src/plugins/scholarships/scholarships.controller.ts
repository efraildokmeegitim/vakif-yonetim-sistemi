import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';

@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.scholarshipsService.create(createDto);
  }

  @Get()
  findAll(@Query('studentCaId') studentCaId?: string) {
    return this.scholarshipsService.findAll(studentCaId ? +studentCaId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scholarshipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.scholarshipsService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scholarshipsService.remove(+id);
  }

  @Get(':id/accruals')
  getAccruals(@Param('id') id: string) {
    return this.scholarshipsService.getAccruals(+id);
  }

  @Post(':id/accruals')
  generateAccrual(@Param('id') id: string, @Body() body: any) {
    return this.scholarshipsService.generateAccrual(+id, body);
  }

  @Get(':id/payments')
  getPayments(@Param('id') id: string) {
    return this.scholarshipsService.getPayments(+id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() body: any) {
    return this.scholarshipsService.addPayment(+id, body);
  }

  @Post(':id/student-details')
  updateStudentDetails(@Param('id') id: string, @Body() body: any) {
    return this.scholarshipsService.updateStudentDetails(+id, body);
  }

  @Post(':id/family-info')
  updateStudentFamilyInfo(@Param('id') id: string, @Body() body: any) {
    return this.scholarshipsService.updateStudentFamilyInfo(+id, body);
  }
}
