import { IsNumber, IsEnum, IsOptional, IsBoolean, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShareType } from '../entities/sacrifice-share.entity';

export class CreateSacrificeShareDto {
  @IsNumber()
  @IsOptional()
  donorId?: number;

  @IsNumber()
  @IsOptional()
  partnerId?: number;

  @IsNumber()
  groupId: number;

  @IsEnum(ShareType)
  shareType: ShareType;

  @IsBoolean()
  @IsOptional()
  isProxyGiven?: boolean;

  @IsNumber()
  amountPaid: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class UpdateSacrificeShareDto {
  @IsNumber()
  @IsOptional()
  donorId?: number;

  @IsNumber()
  @IsOptional()
  groupId?: number;

  @IsEnum(ShareType)
  @IsOptional()
  shareType?: ShareType;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isProxyGiven?: boolean;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsBoolean()
  @IsOptional()
  isMediaSent?: boolean;
}

export class PartnerShareItemDto {
  @IsString()
  @IsOptional()
  tc_no?: string;

  @IsString()
  @IsOptional()
  ad_soyad?: string; // Boş hisse ise null olabilir

  @IsNumber()
  @IsOptional()
  expectedAmount?: number;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsEnum(ShareType)
  shareType: ShareType;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class BulkCreatePartnerSharesDto {
  @IsNumber()
  partnerId: number;

  @IsNumber()
  campaignId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerShareItemDto)
  shares: PartnerShareItemDto[];
}

export class UpdateShareDonorDto {
  @IsString()
  @IsOptional()
  tc_no?: string;

  @IsString()
  @IsOptional()
  ad_soyad?: string;

  @IsString()
  @IsOptional()
  telefon?: string;
}
