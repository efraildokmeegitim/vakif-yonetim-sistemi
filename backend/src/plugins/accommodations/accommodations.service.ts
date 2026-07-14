import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Room } from './entities/room.entity';
import { Reservation } from './entities/reservation.entity';
import { AccommodationGuest } from './entities/accommodation-guest.entity';
import { CreateRoomDto, CreateReservationDto, CreateBulkReservationDto, BulkCheckoutDto, UpdateReservationGuestsDto } from './dto/create-accommodation.dto';
import { CurrentAccount } from '../current-accounts/entities/current-account.entity';

@Injectable()
export class AccommodationsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(AccommodationGuest)
    private readonly guestRepo: Repository<AccommodationGuest>,
    @InjectRepository(CurrentAccount)
    private readonly caRepo: Repository<CurrentAccount>,
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // ROOM MANAGEMENT
  // ==========================================

  async createRoom(dto: CreateRoomDto) {
    const existing = await this.roomRepo.findOne({ where: { name: dto.name, is_active: 1 } });
    if (existing) {
      throw new BadRequestException(`'${dto.name}' adında bir oda zaten mevcut.`);
    }
    const room = this.roomRepo.create({ ...dto, is_active: 1 });
    return this.roomRepo.save(room);
  }

  async findAllRooms() {
    const rooms = await this.roomRepo.find({ where: { is_active: 1 }, order: { name: 'ASC' } });
    
    // Calculate occupied beds dynamically for each room
    const roomsWithBeds = await Promise.all(rooms.map(async (room) => {
      // Check if room is locked exclusively (entire room reserved)
      const entireRoomRes = await this.reservationRepo.findOne({
        where: { room: { id: room.id }, status: 'Aktif', reserves_entire_room: 1 }
      });

      // Calculate occupied beds count
      const activeRes = await this.reservationRepo.find({
        where: { room: { id: room.id }, status: 'Aktif' }
      });

      let occupied_beds = 0;
      let is_reserved_exclusively = !!entireRoomRes;

      activeRes.forEach(r => {
        // Double check date range overlap with today
        const today = new Date().toISOString().split('T')[0];
        if (today >= r.check_in_date && today <= r.check_out_date) {
          occupied_beds += r.guest_count;
        }
      });

      return {
        ...room,
        is_reserved_exclusively,
        occupied_beds,
        available_beds: is_reserved_exclusively ? 0 : Math.max(0, room.capacity - occupied_beds)
      };
    }));

    return roomsWithBeds;
  }

  async updateRoom(id: number, dto: any) {
    const room = await this.roomRepo.findOneBy({ id, is_active: 1 });
    if (!room) {
      throw new NotFoundException('Oda bulunamadı.');
    }
    if (dto.name) {
      const existing = await this.roomRepo.findOne({ where: { name: dto.name, is_active: 1 } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`'${dto.name}' adında bir oda zaten mevcut.`);
      }
    }
    await this.roomRepo.update(id, dto);
    return this.roomRepo.findOneBy({ id });
  }

  async removeRoom(id: number) {
    const room = await this.roomRepo.findOneBy({ id, is_active: 1 });
    if (!room) {
      throw new NotFoundException('Oda bulunamadı.');
    }
    // Check if there are active reservations in this room
    const activeRes = await this.reservationRepo.findOne({
      where: { room: { id }, status: 'Aktif' }
    });
    if (activeRes) {
      throw new BadRequestException('Aktif konaklama kaydı bulunan odalar silinemez.');
    }
    await this.roomRepo.update(id, { is_active: 0 });
    return { success: true };
  }

  // ==========================================
  // RESERVATION MANAGEMENT (ACCOMMODATIONS)
  // ==========================================

  async createReservation(dto: CreateReservationDto) {
    const room = await this.roomRepo.findOneBy({ id: dto.room_id, is_active: 1 });
    if (!room) {
      throw new NotFoundException('Seçilen oda bulunamadı.');
    }
    if (room.status === 'Bakımda') {
      throw new BadRequestException('Bakımda olan odalara rezervasyon yapılamaz.');
    }
    if (room.status === 'Kapalı') {
      throw new BadRequestException('Kapalı olan odalara rezervasyon yapılamaz.');
    }

    // Check overlaps
    const existingReservations = await this.reservationRepo.find({
      where: { room: { id: dto.room_id }, status: 'Aktif' }
    });

    let currentOccupancy = 0;
    let isExclusivelyReserved = false;

    existingReservations.forEach(r => {
      // Check date range overlap
      const hasOverlap = (dto.check_in_date <= r.check_out_date) && (dto.check_out_date >= r.check_in_date);
      if (hasOverlap) {
        if (r.reserves_entire_room === 1) {
          isExclusivelyReserved = true;
        }
        currentOccupancy += r.guest_count;
      }
    });

    if (isExclusivelyReserved) {
      throw new BadRequestException('Bu oda belirtilen tarihlerde başka bir aileye tamamen kapatılmıştır.');
    }
    if (dto.reserves_entire_room === 1 && currentOccupancy > 0) {
      throw new BadRequestException('İçerisinde aktif misafir barındıran oda aileye tamamen kapatılamaz.');
    }
    if (currentOccupancy + dto.guest_count > room.capacity) {
      throw new BadRequestException(`Yetersiz yatak kapasitesi. Oda kapasitesi: ${room.capacity}, Mevcut Doluluk: ${currentOccupancy}, Talep Edilen: ${dto.guest_count}`);
    }

    // Gender check (Warn if room type doesn't match or is mixed)
    // We will do validation here, but let the user override or save normally.
    const guestAccount = await this.caRepo.findOneBy({ id: dto.guest_ca_id });
    if (!guestAccount) {
      throw new NotFoundException('Misafir cari hesabı bulunamadı.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = this.reservationRepo.create({
        guestCaId: dto.guest_ca_id,
        roomId: dto.room_id,
        check_in_date: dto.check_in_date,
        check_out_date: dto.check_out_date,
        guest_count: dto.guest_count,
        notes: dto.notes,
        reserves_entire_room: dto.reserves_entire_room || 0,
        status: 'Aktif'
      });

      const savedReservation = await queryRunner.manager.save(reservation);

      // Eğer oda daha önce tamamen boşsa, ilk misafire göre oda türünü belirle
      if (existingReservations.length === 0) {
        let newRoomType = 'Karma';
        if (dto.reserves_entire_room === 1) {
          newRoomType = 'Aile';
        } else {
          let guestGender = null;
          try {
            const meta = typeof guestAccount.metadata === 'string' ? JSON.parse(guestAccount.metadata) : guestAccount.metadata;
            guestGender = meta?.gender;
          } catch(e) {}
          
          if (guestGender === 'Kadın') newRoomType = 'Kadın';
          else if (guestGender === 'Erkek') newRoomType = 'Erkek';
        }
        await queryRunner.manager.update(Room, room.id, { room_type: newRoomType });
      }

      if (dto.guest_details && dto.guest_details.length > 0) {
        for (const guestDto of dto.guest_details) {
          if (guestDto.ad_soyad && guestDto.ad_soyad.trim()) {
            const guest = this.guestRepo.create({
              ...guestDto,
              reservationId: savedReservation.id
            });
            await queryRunner.manager.save(guest);
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOneReservation(savedReservation.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllReservations() {
    return this.reservationRepo.find({
      relations: { guestAccount: true, room: true, guests: true },
      order: { id: 'DESC' }
    });
  }

  async findOneReservation(id: number) {
    return this.reservationRepo.findOne({
      where: { id },
      relations: { guestAccount: true, room: true, guests: true }
    });
  }

  async updateGuests(id: number, dto: UpdateReservationGuestsDto) {
    const reservation = await this.reservationRepo.findOne({ where: { id }, relations: { room: true, guests: true } });
    if (!reservation) throw new NotFoundException('Rezervasyon bulunamadı.');
    
    const maxCapacity = reservation.room.capacity;
    // The main guest is always 1, so additional guests are maxCapacity - 1
    if (1 + dto.guest_details.length > maxCapacity) {
      throw new BadRequestException(`Oda kapasitesi (${maxCapacity}) aşıldı.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Sadece bu rezervasyona ait mevcut ek misafirleri silelim
      await queryRunner.manager.delete(AccommodationGuest, { reservationId: id });
      
      for (const detail of dto.guest_details) {
        const guest = this.guestRepo.create({
          reservationId: id,
          ...detail
        });
        await queryRunner.manager.save(guest);
      }

      await queryRunner.manager.update(Reservation, id, { guest_count: 1 + dto.guest_details.length });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkout(id: number) {
    const res = await this.reservationRepo.findOneBy({ id });
    if (!res) {
      throw new NotFoundException('Rezervasyon kaydı bulunamadı.');
    }
    await this.reservationRepo.update(id, { status: 'Tamamlandı' });
    
    // Oda tamamen boşaldıysa türünü Karma'ya çevir, ayrıca çıkış yapıldığı için odayı Kirli yap
    const remaining = await this.reservationRepo.count({
      where: { roomId: res.roomId, status: 'Aktif' }
    });
    
    if (remaining === 0) {
      await this.roomRepo.update(res.roomId, { room_type: 'Karma', cleaning_status: 'Kirli' });
    } else {
      await this.roomRepo.update(res.roomId, { cleaning_status: 'Kirli' });
    }

    return this.findOneReservation(id);
  }

  async bulkCheckout(dto: BulkCheckoutDto) {
    for (const id of dto.reservation_ids) {
      await this.checkout(id);
    }
    return { success: true, count: dto.reservation_ids.length };
  }

  async bulkCancel(dto: BulkCheckoutDto) {
    for (const id of dto.reservation_ids) {
      await this.reservationRepo.update(id, { status: 'İptal Edildi' });
    }
    return { success: true, count: dto.reservation_ids.length };
  }

  async createBulkReservation(dto: CreateBulkReservationDto) {
    const guestAccount = await this.caRepo.findOneBy({ id: dto.guest_ca_id });
    if (!guestAccount) {
      throw new NotFoundException('Misafir cari hesabı bulunamadı.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Önce tüm seçili odaların kapasitelerini toplayalım
      const roomCapacities: { roomId: number, room: Room, available: number }[] = [];
      let totalAvailable = 0;

      for (const roomId of dto.room_ids) {
        const room = await this.roomRepo.findOneBy({ id: roomId });
        if (!room) throw new NotFoundException(`Oda ID ${roomId} bulunamadı.`);
        if (room.status === 'Bakımda' || room.status === 'Kapalı') {
          throw new BadRequestException(`Oda ${room.name} bakimda veya kapalı.`);
        }

        const existingReservations = await this.reservationRepo.find({
          where: { room: { id: roomId }, status: 'Aktif' }
        });

        let currentOccupancy = 0;
        let isExclusivelyReserved = false;

        existingReservations.forEach(r => {
          const hasOverlap = (dto.check_in_date <= r.check_out_date) && (dto.check_out_date >= r.check_in_date);
          if (hasOverlap) {
            if (r.reserves_entire_room === 1) isExclusivelyReserved = true;
            currentOccupancy += r.guest_count;
          }
        });

        if (isExclusivelyReserved) {
          throw new BadRequestException(`Oda ${room.name} başka bir aileye tamamen kapatılmıştır.`);
        }
        if (dto.reserves_entire_room === 1 && currentOccupancy > 0) {
          throw new BadRequestException(`Oda ${room.name} içerisinde aktif misafir varken aileye kapatılamaz.`);
        }

        const available = Math.max(0, room.capacity - currentOccupancy);
        totalAvailable += available;
        roomCapacities.push({ roomId, room, available });
      }

      if (dto.guest_count > totalAvailable) {
        throw new BadRequestException(`Seçilen odaların toplam boş kapasitesi (${totalAvailable}) yetersiz.`);
      }

      // 2. Misafirleri odalara dağıt
      const createdReservations = [];
      let remainingGuests = dto.guest_count;
      let remainingDetails = [...(dto.guest_details || [])];
      let mainGuestAssigned = false;

      for (const { roomId, room, available } of roomCapacities) {
        let assigned = 0;
        if (remainingGuests > 0) {
          assigned = Math.min(available, remainingGuests);
          remainingGuests -= assigned;
        }

        // Eğer odaya kimse düşmediyse ve odayı tamamen kapatma (reserves_entire_room) yoksa, bu oda için rezervasyon oluşturma
        if (assigned === 0 && dto.reserves_entire_room !== 1) {
          continue; 
        }

        const reservation = this.reservationRepo.create({
          guestCaId: dto.guest_ca_id,
          roomId: roomId,
          check_in_date: dto.check_in_date,
          check_out_date: dto.check_out_date,
          guest_count: assigned, 
          notes: dto.notes,
          reserves_entire_room: dto.reserves_entire_room || 0
        });

        const savedReservation = await queryRunner.manager.save(reservation);
        
        // Misafir detaylarını (AccommodationGuest) ekleyelim
        let detailsToAssign = 0;
        if (assigned > 0) {
          if (!mainGuestAssigned) {
            // Ana misafir bu odaya yerleşti
            detailsToAssign = assigned - 1;
            mainGuestAssigned = true;
          } else {
            // Ana misafir başka odada, bu odadakilerin tamamı ek misafir
            detailsToAssign = assigned;
          }
        }

        for (let i = 0; i < detailsToAssign; i++) {
          const detail = remainingDetails.shift();
          if (detail) {
            const guest = this.guestRepo.create({
              reservationId: savedReservation.id,
              ...detail
            });
            await queryRunner.manager.save(guest);
          }
        }

        if (room.room_type === 'Karma') {
          const newGender = guestAccount.metadata?.gender === 'Kadın' ? 'Kadın' : 'Erkek';
          await queryRunner.manager.update(Room, roomId, { room_type: newGender });
        } else if (dto.reserves_entire_room === 1) {
          await queryRunner.manager.update(Room, roomId, { room_type: 'Aile' });
        }

        createdReservations.push(savedReservation);
      }

      await queryRunner.commitTransaction();
      return createdReservations;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: number) {
    const res = await this.reservationRepo.findOneBy({ id });
    if (!res) {
      throw new NotFoundException('Rezervasyon kaydı bulunamadı.');
    }
    await this.reservationRepo.update(id, { status: 'İptal Edildi' });
    
    // Oda tamamen boşaldıysa türünü Karma'ya çevir
    const remaining = await this.reservationRepo.count({
      where: { roomId: res.roomId, status: 'Aktif' }
    });
    if (remaining === 0) {
      await this.roomRepo.update(res.roomId, { room_type: 'Karma' });
    }

    return this.findOneReservation(id);
  }

  // ==========================================
  // STATS & REPORTS
  // ==========================================

  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const totalRooms = await this.roomRepo.find({ where: { is_active: 1 } });
    const allRoomsCount = totalRooms.length;

    // Available Rooms Count Today
    const reservationsToday = await this.reservationRepo.find({
      where: { status: 'Aktif' }
    });

    const busyRoomIds = new Set<number>();
    let activeGuests = 0;
    let arrivals = 0;
    let departures = 0;

    reservationsToday.forEach(r => {
      if (today >= r.check_in_date && today <= r.check_out_date) {
        busyRoomIds.add(r.roomId);
        activeGuests += r.guest_count;
      }
      if (r.check_in_date === today) {
        arrivals++;
      }
      if (r.check_out_date === today) {
        departures++;
      }
    });

    const availableRooms = Math.max(0, allRoomsCount - busyRoomIds.size);

    return {
      totalRooms: allRoomsCount,
      availableRooms,
      activeGuests,
      todayArrivals: arrivals,
      todayDepartures: departures
    };
  }

  async getDailyReport(date: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const reservations = await this.reservationRepo.find({
      where: { status: 'Aktif' },
      relations: { guestAccount: true, room: true, guests: true }
    });

    // Filter overlapping records manually or through query
    const activeOnDate = reservations.filter(r => {
      return targetDate >= r.check_in_date && targetDate <= r.check_out_date;
    });

    return activeOnDate;
  }

  // ==========================================
  // HOUSEKEEPING & DETAILED REPORTS
  // ==========================================

  async updateCleaningStatus(roomId: number, status: string) {
    const room = await this.roomRepo.findOneBy({ id: roomId });
    if (!room) {
      throw new NotFoundException('Oda bulunamadı.');
    }
    await this.roomRepo.update(roomId, { cleaning_status: status });
    return this.roomRepo.findOneBy({ id: roomId });
  }

  async getDetailedReports() {
    // 30 günlük trend
    const today = new Date();
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const activeRes = await this.reservationRepo.createQueryBuilder('res')
        .where('res.status = :status', { status: 'Aktif' })
        .andWhere('res.check_in_date <= :dateStr', { dateStr })
        .andWhere('res.check_out_date > :dateStr', { dateStr })
        .getMany();

      let dailyGuests = 0;
      activeRes.forEach(r => { dailyGuests += r.guest_count; });

      trend.push({
        date: dateStr,
        guests: dailyGuests
      });
    }

    // Aktif misafir cinsiyet dağılımı
    const currentActiveRes = await this.findAllReservations();
    let femaleCount = 0;
    let maleCount = 0;
    let unknownCount = 0;

    currentActiveRes.forEach(r => {
      // Main guest
      let guestGender = null;
      try {
        const meta = typeof r.guestAccount?.metadata === 'string' ? JSON.parse(r.guestAccount.metadata) : r.guestAccount?.metadata;
        guestGender = meta?.gender;
      } catch(e) {}

      if (guestGender === 'Kadın') femaleCount += r.reserves_entire_room ? r.guest_count : 1;
      else if (guestGender === 'Erkek') maleCount += r.reserves_entire_room ? r.guest_count : 1;
      else unknownCount += r.reserves_entire_room ? r.guest_count : 1;

      // Diğer misafirleri döngüyle de sayabiliriz ancak aile kapanmasında zaten hepsi count içinde geçiyor.
      // Eger sadece rezervasyon detaylarindaki "guests" var ise onu kullan.
      if (r.guests && !r.reserves_entire_room) {
        r.guests.forEach(g => {
          if (g.cinsiyet === 'Kadın') femaleCount++;
          else if (g.cinsiyet === 'Erkek') maleCount++;
          else unknownCount++;
        });
      }
    });

    return {
      trend,
      genderDistribution: [
        { name: 'Kadın', value: femaleCount, fill: '#ec4899' },
        { name: 'Erkek', value: maleCount, fill: '#3b82f6' },
        { name: 'Belirtilmemiş', value: unknownCount, fill: '#94a3b8' }
      ]
    };
  }
}
