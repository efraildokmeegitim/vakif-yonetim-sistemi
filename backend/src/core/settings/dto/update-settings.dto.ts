import { IsString, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  vakif_adi?: string;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  adres?: string;

  @IsString()
  @IsOptional()
  para_birimi?: string;

  @IsString()
  @IsOptional()
  foundation_name_tr?: string;

  @IsString()
  @IsOptional()
  foundation_name_local?: string;

  @IsString()
  @IsOptional()
  foundation_contact?: string;

  @IsString()
  @IsOptional()
  foundation_email?: string;

  @IsString()
  @IsOptional()
  foundation_address?: string;

  @IsString()
  @IsOptional()
  local_currency_symbol?: string;

  @IsString()
  @IsOptional()
  vergi_dairesi?: string;

  @IsString()
  @IsOptional()
  vergi_no?: string;

  @IsString()
  @IsOptional()
  izin_tarihi?: string;

  @IsString()
  @IsOptional()
  izin_no?: string;

  @IsString()
  @IsOptional()
  sms_provider?: string;

  @IsString()
  @IsOptional()
  sms_username?: string;

  @IsString()
  @IsOptional()
  sms_password?: string;

  @IsString()
  @IsOptional()
  sms_sender_title?: string;
}
