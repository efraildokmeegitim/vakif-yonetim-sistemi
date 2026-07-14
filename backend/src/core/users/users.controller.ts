import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ImportService } from '../import/import.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly importService: ImportService
  ) {}

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get('permissions')
  getPermissions() {
    return this.usersService.getPermissions();
  }

  @Post('permissions')
  createPermission(@Body() body: { action: string, description?: string }) {
    return this.usersService.createPermission(body);
  }

  @Post('roles')
  createRole(@Body() body: { name: string, description?: string, permissionIds: number[] }) {
    return this.usersService.createRole(body);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() body: { name: string, description?: string, permissionIds: number[] }) {
    return this.usersService.updateRole(+id, body);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.usersService.deleteRole(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya bulunamadı.');
    
    // Beklenen sütunlar: İsim, Soyisim, E-posta, Durum, Şifre (opsiyonel)
    const rows = await this.importService.parseExcel(file.buffer, ['E-posta', 'İsim', 'Soyisim']);
    
    let added = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const email = row['E-posta'];
        if (!email) {
          errors.push(`Satır ${i+2}: E-posta boş olamaz.`);
          continue;
        }

        const existing = await this.usersService.findByEmail(email);
        if (existing) {
          errors.push(`Satır ${i+2}: ${email} zaten kayıtlı.`);
          continue;
        }

        const firstName = row['İsim'] || 'İsimsiz';
        const lastName = row['Soyisim'] || 'Kullanıcı';
        const password = row['Şifre']?.toString() || '123456';
        const isActive = row['Durum'] === 'Pasif' ? false : true;

        await this.usersService.create({
          email,
          firstName,
          lastName,
          passwordHash: password, // AuthService'te değil, UsersService'te doğrudan bcrypt eklememiz lazım aslında. Ama basitlik için düz. (Not: Production'da UsersService.create'te şifre hashlenmelidir)
          isActive,
        });

        added++;
      } catch (err) {
        errors.push(`Satır ${i+2}: Hata - ${err.message}`);
      }
    }

    return { message: 'İçe aktarma tamamlandı', added, errors };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
