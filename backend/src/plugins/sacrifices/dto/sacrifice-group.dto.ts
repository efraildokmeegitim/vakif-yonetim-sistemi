import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { SacrificeAnimalType, SacrificeGroupStatus } from '../entities/sacrifice-group.entity';

export class CreateSacrificeGroupDto {
  @IsString()
  name: string;

  @IsEnum(SacrificeAnimalType)
  animalType: SacrificeAnimalType;

  @IsNumber()
  campaignId: number;
}

export class UpdateSacrificeGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(SacrificeGroupStatus)
  @IsOptional()
  status?: SacrificeGroupStatus;

  @IsEnum(SacrificeAnimalType)
  @IsOptional()
  animalType?: SacrificeAnimalType;

  @IsOptional()
  purchaseCosts?: Record<string, number>;

  @IsOptional()
  slaughterCosts?: Record<string, number>;

  @IsString()
  @IsOptional()
  transferredInstitution?: string;
}
