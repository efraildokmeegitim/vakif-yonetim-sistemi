import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectCategory } from './entities/project-category.entity';
import { ProjectBudget } from './entities/project-budget.entity';
import { ProjectFile } from './entities/project-file.entity';
import { Sponsorship } from './entities/sponsorship.entity';
import { ProjectMetadata } from './entities/project-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectCategory, ProjectBudget, ProjectFile, Sponsorship, ProjectMetadata])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
