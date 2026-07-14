import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>
  ) {}

  async findAll() {
    const settings = await this.settingsRepo.find();
    const raw: any = {};
    settings.forEach(s => {
      raw[s.key] = s.value;
    });
    return {
      vakif_adi: raw['foundation_name_tr'] || raw['foundation_name_local'] || raw['vakif_adi'] || '',
      telefon: raw['foundation_contact'] || raw['telefon'] || '',
      email: raw['foundation_email'] || raw['email'] || '',
      adres: raw['foundation_address'] || raw['adres'] || '',
      para_birimi: raw['local_currency_symbol'] || raw['para_birimi'] || 'TL',
      vergi_dairesi: raw['foundation_tax_office'] || raw['vergi_dairesi'] || '',
      vergi_no: raw['foundation_tax_number'] || raw['vergi_no'] || '',
      izin_tarihi: raw['donation_permit_date'] || raw['izin_tarihi'] || '',
      izin_no: raw['donation_permit_number'] || raw['izin_no'] || '',
      sms_provider: raw['sms_provider'] || 'none',
      sms_username: raw['sms_username'] || '',
      sms_password: raw['sms_password'] || '',
      sms_sender_title: raw['sms_sender_title'] || ''
    };
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const mappings: { [key: string]: string | undefined } = {
      'foundation_name_tr': updateSettingsDto.vakif_adi,
      'foundation_name_local': updateSettingsDto.vakif_adi,
      'foundation_contact': updateSettingsDto.telefon,
      'foundation_email': updateSettingsDto.email,
      'foundation_address': updateSettingsDto.adres,
      'local_currency_symbol': updateSettingsDto.para_birimi,
      'foundation_tax_office': updateSettingsDto.vergi_dairesi,
      'foundation_tax_number': updateSettingsDto.vergi_no,
      'donation_permit_date': updateSettingsDto.izin_tarihi,
      'donation_permit_number': updateSettingsDto.izin_no,
      'sms_provider': updateSettingsDto.sms_provider,
      'sms_username': updateSettingsDto.sms_username,
      'sms_password': updateSettingsDto.sms_password,
      'sms_sender_title': updateSettingsDto.sms_sender_title
    };

    const promises = [];
    for (const [dbKey, val] of Object.entries(mappings)) {
      if (val !== undefined && val !== null) {
        promises.push(this.settingsRepo.save({ key: dbKey, value: val }));
      }
    }
    await Promise.all(promises);
    return this.findAll();
  }
}
