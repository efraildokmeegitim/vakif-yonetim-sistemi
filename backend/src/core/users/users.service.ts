import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedRolesAndAdmin();
  }

  private async seedRolesAndAdmin() {
    try {
      // 1. Tüm sistem yetkilerini seed et
      const defaultPermissions = [
        { action: 'all', description: 'Tam Erişim (Sistem Yöneticisi)' },
        { action: 'view:current-accounts', description: 'Cari Hesapları Görüntüle' },
        { action: 'manage:current-accounts', description: 'Cari Hesapları Yönet' },
        { action: 'view:wallets', description: 'Kasaları Görüntüle' },
        { action: 'manage:wallets', description: 'Kasaları Yönet' },
        { action: 'view:sacrifices', description: 'Kurban Modülünü Görüntüle' },
        { action: 'manage:sacrifices', description: 'Kurban Modülünü Yönet' },
        { action: 'view:personnel', description: 'Personel Modülünü Görüntüle' },
        { action: 'manage:personnel', description: 'Personel Modülünü Yönet' },
        { action: 'view:scholarships', description: 'Burs Modülünü Görüntüle' },
        { action: 'manage:scholarships', description: 'Burs Modülünü Yönet' },
        { action: 'view:assets', description: 'Demirbaş Modülünü Görüntüle' },
        { action: 'manage:assets', description: 'Demirbaş Modülünü Yönet' },
        { action: 'view:lodgings', description: 'Lojman Modülünü Görüntüle' },
        { action: 'manage:lodgings', description: 'Lojman Modülünü Yönet' },
        { action: 'view:warehouses', description: 'Depo Modülünü Görüntüle' },
        { action: 'manage:warehouses', description: 'Depo Modülünü Yönet' },
        { action: 'view:stock', description: 'Ayni Yardım Modülünü Görüntüle' },
        { action: 'manage:stock', description: 'Ayni Yardım Modülünü Yönet' },
        { action: 'view:tasks', description: 'Görev Modülünü Görüntüle' },
        { action: 'manage:tasks', description: 'Görev Modülünü Yönet' },
        { action: 'view:projects', description: 'Proje Modülünü Görüntüle' },
        { action: 'manage:projects', description: 'Proje Modülünü Yönet' },
        { action: 'view:soup-kitchen', description: 'Aşevi Modülünü Görüntüle' },
        { action: 'manage:soup-kitchen', description: 'Aşevi Modülünü Yönet' },
        { action: 'view:vehicles', description: 'Araç Modülünü Görüntüle' },
        { action: 'manage:vehicles', description: 'Araç Modülünü Yönet' },
        { action: 'view:sponsorships', description: 'Sponsorluk Modülünü Görüntüle' },
        { action: 'manage:sponsorships', description: 'Sponsorluk Modülünü Yönet' },
        { action: 'view:publications', description: 'Yayın Modülünü Görüntüle' },
        { action: 'manage:publications', description: 'Yayın Modülünü Yönet' },
        { action: 'view:users', description: 'Kullanıcıları Görüntüle' },
        { action: 'manage:users', description: 'Kullanıcıları Yönet' },
        { action: 'view:settings', description: 'Sistem Ayarlarını Görüntüle' },
        { action: 'manage:settings', description: 'Sistem Ayarlarını Yönet' },
        { action: 'view:reports', description: 'Raporları Görüntüle' },
        { action: 'manage:reports', description: 'Raporları Yönet' },
      ];

      for (const perm of defaultPermissions) {
        const exists = await this.permissionsRepository.findOne({ where: { action: perm.action } });
        if (!exists) {
          await this.permissionsRepository.save(this.permissionsRepository.create(perm));
        }
      }

      let adminPermission = await this.permissionsRepository.findOne({ where: { action: 'all' } });

      // 2. Admin rolü oluştur
      let adminRole = await this.rolesRepository.findOne({ where: { name: 'Admin' }, relations: { permissions: true } });
      if (!adminRole) {
        adminRole = this.rolesRepository.create({ name: 'Admin', description: 'Sistem Yöneticisi', permissions: [adminPermission!] });
        await this.rolesRepository.save(adminRole);
      } else {
        if (!adminRole.permissions.some(p => p.action === 'all')) {
          adminRole.permissions.push(adminPermission!);
          await this.rolesRepository.save(adminRole);
        }
      }

      // 3. Mevcut kullanıcılara Admin rolünü ver (varsayılan olarak sistemi kullanabilmeleri için)
      const allUsers = await this.usersRepository.find({ relations: { roleObject: true } });
      for (const user of allUsers) {
        if (!user.roleObject) {
          user.roleObject = adminRole;
          await this.usersRepository.save(user);
        }
      }
    } catch (error) {
      console.error('Seed error:', error);
    }
  }

  async getRoles() {
    return this.rolesRepository.find({ relations: { permissions: true } });
  }

  async getPermissions() {
    return this.permissionsRepository.find({ order: { description: 'ASC' } });
  }

  async createPermission(data: { action: string, description?: string }) {
    const perm = this.permissionsRepository.create({
      action: data.action,
      description: data.description
    });
    return this.permissionsRepository.save(perm);
  }

  async createRole(data: { name: string, description?: string, permissionIds: number[] }) {
    const permissions = await this.permissionsRepository.findBy({ id: In(data.permissionIds) });
    const role = this.rolesRepository.create({
      name: data.name,
      description: data.description,
      permissions
    });
    return this.rolesRepository.save(role);
  }

  async updateRole(id: number, data: { name: string, description?: string, permissionIds: number[] }) {
    const role = await this.rolesRepository.findOne({ where: { id }, relations: { permissions: true } });
    if (!role) throw new NotFoundException('Rol bulunamadı');
    
    role.name = data.name;
    role.description = data.description || '';
    role.permissions = await this.permissionsRepository.findBy({ id: In(data.permissionIds) });
    
    return this.rolesRepository.save(role);
  }

  async deleteRole(id: number) {
    const role = await this.rolesRepository.findOne({ where: { id }, relations: { users: true } });
    if (!role) throw new NotFoundException('Rol bulunamadı');
    if (role.name === 'Admin') throw new BadRequestException('Sistem yöneticisi rolü silinemez!');
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('Bu role bağlı kullanıcılar bulunmaktadır. Önce kullanıcıların rollerini değiştirin.');
    }
    return this.rolesRepository.remove(role);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: { roleObject: { permissions: true } } });
  }

  async create(createUserDto: CreateUserDto | Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true, role: true, createdAt: true, updatedAt: true }
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true, role: true, createdAt: true, updatedAt: true }
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  async update(id: number, updateUserDto: any) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    
    if (updateUserDto.roleId) {
      const role = await this.rolesRepository.findOne({ where: { id: updateUserDto.roleId } });
      if (role) {
        user.roleObject = role;
      }
      delete updateUserDto.roleId;
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return this.usersRepository.remove(user);
  }
}
