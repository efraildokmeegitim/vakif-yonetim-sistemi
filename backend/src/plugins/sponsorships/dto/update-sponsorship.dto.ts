import { PartialType } from '@nestjs/mapped-types';
import { CreateSponsorshipDto } from './create-sponsorship.dto';

export class UpdateSponsorshipDto extends PartialType(CreateSponsorshipDto) {}
