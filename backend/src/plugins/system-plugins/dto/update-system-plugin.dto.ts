import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemPluginDto } from './create-system-plugin.dto';

export class UpdateSystemPluginDto extends PartialType(CreateSystemPluginDto) {}
