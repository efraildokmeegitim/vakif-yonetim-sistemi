import { IsString, IsNumber, IsBoolean, IsOptional, IsDecimal } from 'class-validator';

export class CreateSacrificeCampaignDto {
  @IsString()
  name: string;

  @IsNumber()
  year: number;

  @IsNumber()
  defaultSharePrice: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSacrificeCampaignDto extends CreateSacrificeCampaignDto {}
