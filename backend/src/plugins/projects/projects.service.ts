import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectCategory } from './entities/project-category.entity';
import { ProjectBudget } from './entities/project-budget.entity';
import { ProjectFile } from './entities/project-file.entity';
import { Sponsorship } from './entities/sponsorship.entity';
import { ProjectMetadata } from './entities/project-metadata.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectCategory) private categoryRepo: Repository<ProjectCategory>,
    @InjectRepository(ProjectBudget) private budgetRepo: Repository<ProjectBudget>,
    @InjectRepository(ProjectFile) private fileRepo: Repository<ProjectFile>,
    @InjectRepository(Sponsorship) private sponsorshipRepo: Repository<Sponsorship>,
    @InjectRepository(ProjectMetadata) private metadataRepo: Repository<ProjectMetadata>,
    private dataSource: DataSource
  ) {}

  async findAll(query: any) {
    const qb = this.projectRepo.createQueryBuilder('p')
      .leftJoinAndMapOne('p.category', ProjectCategory, 'pc', 'p.project_category_id = pc.id')
      .where('p.is_active = :isActive', { isActive: query.archived === 'true' ? false : true });
      
    if (query.search) {
      qb.andWhere('p.name LIKE :search', { search: `%${query.search}%` });
    }
    
    if (query.partnerId) {
      qb.andWhere('p.partnerCurrentAccountId = :partnerId', { partnerId: query.partnerId });
    }
    
    qb.orderBy('p.start_date', 'DESC');
    const projects = await qb.getMany();
    
    // Fetch financials
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      const financials = await this.dataSource.query(`
        SELECT t.project_id, w.currency,
               SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
               SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE t.project_id IN (?)
        GROUP BY t.project_id, w.currency
      `, [projectIds]);
      
      projects.forEach(p => {
        (p as any).financials = financials.filter((f: any) => f.project_id === p.id);
      });
    }

    const statsResult = await this.dataSource.query(`
      SELECT
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'Devam Ediyor' AND is_active = 1 THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'Tamamlandı' AND is_active = 1 THEN 1 ELSE 0 END) as completed_projects
      FROM projects
    `);

    return { projects, stats: statsResult[0] };
  }

  async getCategories() {
    return this.categoryRepo.find();
  }

  async create(data: any) {
    const project = this.projectRepo.create(data);
    const savedProject = await this.projectRepo.save(project);

    if (data.budgetItems && data.budgetItems.length > 0) {
      const budgets = data.budgetItems.map((b: any) => this.budgetRepo.create({ ...b, projectId: (savedProject as any).id }));
      await this.budgetRepo.save(budgets);
    }
    return savedProject;
  }

  async findOne(id: number) {
    const project = await this.projectRepo.findOneBy({ id });
    if (!project) throw new NotFoundException('Proje bulunamadı');

    const [category] = await this.dataSource.query('SELECT name FROM project_categories WHERE id = ?', [project.projectCategoryId]);
    if (category) (project as any).category_name = category.name;

    const transactions = await this.dataSource.query(`
      SELECT t.*, w.currency, tt.name as type_name, ca.name as current_account_name
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
      LEFT JOIN current_accounts ca ON t.current_account_id = ca.id
      WHERE t.project_id = ?
      ORDER BY t.transactionDate DESC
    `, [id]);

    const financials = await this.dataSource.query(`
      SELECT w.currency,
             SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
             SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id
      WHERE t.project_id = ?
      GROUP BY w.currency
    `, [id]);
    
    financials.forEach((f: any) => f.balance = f.total_income - f.total_expense);

    const budgetItems = await this.budgetRepo.find({ where: { projectId: id } });
    const sponsorships = await this.dataSource.query(`
      SELECT s.*, ca.name as sponsor_name
      FROM sponsorships s
      LEFT JOIN current_accounts ca ON s.sponsor_ca_id = ca.id
      WHERE s.project_id = ?
    `, [id]);

    const files = await this.fileRepo.find({ where: { projectId: id }, order: { uploadedAt: 'DESC' } });
    const metadata = await this.metadataRepo.findOne({ where: { projectId: id } });

    return { project, transactions, financials, budgetItems, sponsorships, files, metadata };
  }
  
  async archive(id: number) {
    await this.projectRepo.update(id, { isActive: false });
    return { success: true };
  }

  // --- Files ---
  async getFiles(projectId: number) {
    return this.fileRepo.find({ where: { projectId }, order: { uploadedAt: 'DESC' } });
  }

  async addFile(projectId: number, data: any) {
    const file = this.fileRepo.create({ ...data, projectId });
    return this.fileRepo.save(file);
  }

  async removeFile(fileId: number) {
    await this.fileRepo.delete(fileId);
    return { success: true };
  }

  // --- Metadata ---
  async updateMetadata(projectId: number, data: any) {
    let metadata = await this.metadataRepo.findOne({ where: { projectId } });
    if (!metadata) {
      metadata = this.metadataRepo.create({ projectId });
    }
    
    if (data.beneficiary_count !== undefined) metadata.beneficiaryCount = data.beneficiary_count;
    if (data.region_population !== undefined) metadata.regionPopulation = data.region_population;
    if (data.muslim_population_percent !== undefined) metadata.muslimPopulationPercent = data.muslim_population_percent;
    if (data.muslim_population !== undefined) metadata.muslimPopulation = data.muslim_population;
    if (data.notes_on_region !== undefined) metadata.notesOnRegion = data.notes_on_region;
    if (data.similar_projects_nearby !== undefined) metadata.similarProjectsNearby = data.similar_projects_nearby;
    if (data.technical_details !== undefined) metadata.technicalDetails = data.technical_details;

    return this.metadataRepo.save(metadata);
  }
}
