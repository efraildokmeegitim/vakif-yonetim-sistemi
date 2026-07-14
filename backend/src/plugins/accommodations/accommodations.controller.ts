import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AccommodationsService } from './accommodations.service';
import { CreateRoomDto, CreateReservationDto, CreateBulkReservationDto, BulkCheckoutDto, UpdateReservationGuestsDto } from './dto/create-accommodation.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accommodations')
export class AccommodationsController {
  constructor(private readonly service: AccommodationsService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('daily-report')
  getDailyReport(@Query('date') date: string) {
    return this.service.getDailyReport(date);
  }

  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.service.createRoom(dto);
  }

  @Get('rooms')
  findAllRooms() {
    return this.service.findAllRooms();
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateRoom(+id, dto);
  }

  @Delete('rooms/:id')
  removeRoom(@Param('id') id: string) {
    return this.service.removeRoom(+id);
  }

  @Post('reservations')
  createReservation(@Body() dto: CreateReservationDto) {
    return this.service.createReservation(dto);
  }

  @Get('reservations')
  findAllReservations() {
    return this.service.findAllReservations();
  }

  @Post('reservations/bulk')
  createBulkReservation(@Body() dto: CreateBulkReservationDto) {
    return this.service.createBulkReservation(dto);
  }

  @Post('reservations/bulk-cancel')
  bulkCancel(@Body() dto: BulkCheckoutDto) {
    return this.service.bulkCancel(dto);
  }

  @Patch('reservations/:id/guests')
  updateGuests(@Param('id') id: string, @Body() dto: UpdateReservationGuestsDto) {
    return this.service.updateGuests(+id, dto);
  }

  @Post('reservations/bulk-checkout')
  bulkCheckout(@Body() dto: BulkCheckoutDto) {
    return this.service.bulkCheckout(dto);
  }

  @Post('reservations/:id/checkout')
  checkout(@Param('id') id: string) {
    return this.service.checkout(+id);
  }

  @Post('reservations/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(+id);
  }

  @Patch('rooms/:id/cleaning-status')
  updateCleaningStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateCleaningStatus(+id, status);
  }

  @Get('reports/detailed')
  getDetailedReports() {
    return this.service.getDetailedReports();
  }
}
