import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  personnel_id?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class CreateTaskAdvanceDto {
  @IsNumber()
  wallet_id: number;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  transaction_date: string;
}

export class TaskExpenseDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsNumber()
  @IsOptional()
  type_id?: number;
}

export class SettleTaskDto {
  @IsNumber()
  wallet_id: number;

  @IsDateString()
  payment_date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskExpenseDto)
  expenses: TaskExpenseDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  advances_to_settle: number[];
}
