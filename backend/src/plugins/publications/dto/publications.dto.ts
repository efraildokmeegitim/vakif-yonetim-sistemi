import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsNumber()
  subscriber_ca_id: number;

  @IsNumber()
  publication_id: number;

  @IsDateString()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsNumber()
  @IsOptional()
  gift_publication_id?: number | string; // from ItemPicker might be empty string ''

  @IsEnum(['Ödendi', 'Ödenmedi'])
  payment_status: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  wallet_id?: number | string;
}

export class SaleItemDto {
  @IsNumber()
  id: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateSaleDto {
  @IsNumber()
  wallet_id: number;

  @IsDateString()
  transaction_date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
