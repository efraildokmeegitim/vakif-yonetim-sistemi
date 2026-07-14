import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CreateProjectDto, CreateProjectFileDto, UpdateProjectMetadataDto } from './dto/projects.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.projectsService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.projectsService.getCategories();
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.projectsService.archive(+id);
  }

  @Post(':id/files')
  addFile(@Param('id') id: string, @Body() dto: CreateProjectFileDto) {
    return this.projectsService.addFile(+id, dto);
  }

  @Post('files/:fileId/delete')
  removeFile(@Param('fileId') fileId: string) {
    return this.projectsService.removeFile(+fileId);
  }

  @Post(':id/metadata')
  updateMetadata(@Param('id') id: string, @Body() dto: UpdateProjectMetadataDto) {
    return this.projectsService.updateMetadata(+id, dto);
  }
}
