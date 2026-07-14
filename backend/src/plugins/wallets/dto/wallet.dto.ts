import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  groupType?: 'Fiziksel' | 'Emanet';

  @IsString()
  @IsOptional()
  fundType?: string;

  @IsNumber()
  @IsOptional()
  linkedCurrentAccountId?: number;
}

export class UpdateWalletDto extends CreateWalletDto {}
