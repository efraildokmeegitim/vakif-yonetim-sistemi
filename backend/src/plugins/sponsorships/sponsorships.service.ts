import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSponsorshipDto, CreateSponsorshipPaymentDto } from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';
import { Sponsorship } from './entities/sponsorship.entity';
import { SponsorshipPayment } from './entities/sponsorship-payment.entity';
import { CurrentAccount } from '../current-accounts/entities/current-account.entity';

@Injectable()
export class SponsorshipsService {
  constructor(
    @InjectRepository(Sponsorship)
    private readonly sponsorshipRepo: Repository<Sponsorship>,
    @InjectRepository(SponsorshipPayment)
    private readonly paymentRepo: Repository<SponsorshipPayment>,
    @InjectRepository(CurrentAccount)
    private readonly currentAccountRepo: Repository<CurrentAccount>,
  ) {}

  async create(createSponsorshipDto: CreateSponsorshipDto) {
    const sponsor = await this.currentAccountRepo.findOne({ where: { id: createSponsorshipDto.sponsor_id } });
    if (!sponsor) throw new NotFoundException('Sponsor bulunamadı');

    let beneficiary = undefined;
    if (createSponsorshipDto.beneficiary_id) {
      const foundBeneficiary = await this.currentAccountRepo.findOne({ where: { id: createSponsorshipDto.beneficiary_id } });
      if (foundBeneficiary) beneficiary = foundBeneficiary;
    }

    const sponsorship = this.sponsorshipRepo.create({
      ...createSponsorshipDto,
      sponsor,
      beneficiary,
    });
    return this.sponsorshipRepo.save(sponsorship);
  }

  async findAll(query?: any) {
    const qb = this.sponsorshipRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.sponsor', 'sponsor')
      .leftJoinAndSelect('s.beneficiary', 'beneficiary')
      .leftJoinAndSelect('s.payments', 'payments')
      .orderBy('s.start_date', 'DESC');
      
    if (query?.sponsorId) {
      qb.andWhere('s.sponsor_id = :sponsorId', { sponsorId: query.sponsorId });
    }
    
    return await qb.getMany();
  }

  async findOne(id: number) {
    const sponsorship = await this.sponsorshipRepo.findOne({
      where: { id },
      relations: { sponsor: true, beneficiary: true, payments: true },
    });
    if (!sponsorship) throw new NotFoundException('Sponsorluk kaydı bulunamadı');
    return sponsorship;
  }

  async update(id: number, updateSponsorshipDto: UpdateSponsorshipDto) {
    const sponsorship = await this.findOne(id);
    if (updateSponsorshipDto.sponsor_id) {
      const sponsor = await this.currentAccountRepo.findOne({ where: { id: updateSponsorshipDto.sponsor_id } });
      if (sponsor) sponsorship.sponsor = sponsor;
    }
    if (updateSponsorshipDto.beneficiary_id) {
      const beneficiary = await this.currentAccountRepo.findOne({ where: { id: updateSponsorshipDto.beneficiary_id } });
      if (beneficiary) sponsorship.beneficiary = beneficiary;
    }
    
    Object.assign(sponsorship, updateSponsorshipDto);
    return this.sponsorshipRepo.save(sponsorship);
  }

  async remove(id: number) {
    const sponsorship = await this.findOne(id);
    return this.sponsorshipRepo.remove(sponsorship);
  }

  // Payments
  async addPayment(sponsorshipId: number, dto: CreateSponsorshipPaymentDto) {
    const sponsorship = await this.findOne(sponsorshipId);
    const payment = this.paymentRepo.create({
      ...dto,
      sponsorship,
    });
    return this.paymentRepo.save(payment);
  }

  async removePayment(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Ödeme kaydı bulunamadı');
    return this.paymentRepo.remove(payment);
  }
}
