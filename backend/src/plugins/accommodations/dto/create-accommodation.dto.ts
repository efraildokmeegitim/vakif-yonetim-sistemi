import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsNumber()
  capacity: number;

  @IsEnum(['Erkek', 'Kadın', 'Aile', 'Karma'])
  room_type: string;

  @IsEnum(['Kullanılabilir', 'Bakımda', 'Kapalı'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GuestDetailDto {
  @IsString()
  @IsOptional()
  tc_no?: string;

  @IsString()
  ad_soyad: string;

  @IsString()
  @IsOptional()
  dogum_tarihi?: string;

  @IsString()
  @IsOptional()
  cinsiyet?: string;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsString()
  @IsOptional()
  adres?: string;

  @IsString()
  @IsOptional()
  notlar?: string;
}

export class CreateReservationDto {
  @IsNumber()
  guest_ca_id: number;

  @IsNumber()
  room_id: number;

  @IsString()
  check_in_date: string;

  @IsString()
  check_out_date: string;

  @IsNumber()
  guest_count: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  reserves_entire_room?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GuestDetailDto)
  guest_details?: GuestDetailDto[];
}

export class CreateBulkReservationDto {
  @IsNumber()
  guest_ca_id: number;

  @IsArray()
  @IsNumber({}, { each: true })
  room_ids: number[];

  @IsString()
  check_in_date: string;

  @IsString()
  check_out_date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  reserves_entire_room?: number;

  @IsNumber()
  guest_count: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GuestDetailDto)
  guest_details?: GuestDetailDto[];
}

export class BulkCheckoutDto {
  @IsArray()
  @IsNumber({}, { each: true })
  reservation_ids: number[];
}

export class UpdateReservationGuestsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDetailDto)
  guest_details: GuestDetailDto[];
}
