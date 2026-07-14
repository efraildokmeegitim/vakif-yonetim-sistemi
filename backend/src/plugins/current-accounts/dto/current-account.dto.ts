import { IsString, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { AccountCategory } from '../entities/current-account.entity';

export class CreateCurrentAccountDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(AccountCategory)
  accountCategory?: AccountCategory;

  @IsOptional()
  typeIds?: number[];

  @IsOptional()
  @IsString()
  identityNumber?: string;

  @IsOptional()
  @IsString()
  taxOffice?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateCurrentAccountDto extends CreateCurrentAccountDto {}
