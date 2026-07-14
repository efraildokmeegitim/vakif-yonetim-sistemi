import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  groupType?: 'Fiziksel' | 'Emanet' | 'Banka';

  @IsString()
  @IsOptional()
  fundType?: string;

  @IsNumber()
  @IsOptional()
  linkedCurrentAccountId?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  branchName?: string;

  @IsString()
  @IsOptional()
  iban?: string;
}

export class UpdateWalletDto extends CreateWalletDto {}
