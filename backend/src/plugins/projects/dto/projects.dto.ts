import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  estimatedAmount: number;

  @IsString()
  currency: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  is_campaign?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  budgetItems?: BudgetItemDto[];
}

export class CreateProjectFileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  file_url: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectMetadataDto {
  @IsNumber()
  @IsOptional()
  beneficiary_count?: number;

  @IsNumber()
  @IsOptional()
  region_population?: number;

  @IsNumber()
  @IsOptional()
  muslim_population_percent?: number;

  @IsNumber()
  @IsOptional()
  muslim_population?: number;

  @IsString()
  @IsOptional()
  notes_on_region?: string;

  @IsString()
  @IsOptional()
  similar_projects_nearby?: string;

  @IsOptional()
  technical_details?: any;
}
