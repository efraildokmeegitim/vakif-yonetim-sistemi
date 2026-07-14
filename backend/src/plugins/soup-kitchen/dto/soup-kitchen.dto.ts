import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  meals: string;

  @IsNumber()
  totalPortions: number;
}

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  meals?: string;

  @IsNumber()
  @IsOptional()
  totalPortions?: number;
}

export class CreateDistributionDto {
  @IsNumber()
  menuId: number;

  @IsNumber()
  @IsOptional()
  householdId?: number;

  @IsString()
  @IsOptional()
  anonymousName?: string;

  @IsNumber()
  portionCount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateDistributionDto {
  @IsNumber()
  @IsOptional()
  householdId?: number;

  @IsString()
  @IsOptional()
  anonymousName?: string;

  @IsNumber()
  @IsOptional()
  portionCount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
