import { IsNumber, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsNumber()
  walletId: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  currency: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  currentAccountId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}

export class TransferFundsDto {
  @IsNumber()
  fromWalletId: number;

  @IsNumber()
  toWalletId: number;

  @IsString()
  fromCurrency: string; // Hangi döviz cinsinden çıkış yapılacak

  @IsString()
  toCurrency: string; // Hangi döviz cinsine giriş yapılacak

  @IsNumber()
  amountSent: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number; // İşlem için anlaşılan kur

  @IsNumber()
  @IsOptional()
  amountReceived?: number; // Kasaya giren net tutar

  @IsString()
  @IsOptional()
  description?: string;
}
