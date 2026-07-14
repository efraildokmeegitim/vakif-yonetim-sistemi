import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SacrificeCampaign } from './entities/sacrifice-campaign.entity';
import { SacrificeGroup, SacrificeAnimalType, SacrificeGroupStatus } from './entities/sacrifice-group.entity';
import { SacrificeShare } from './entities/sacrifice-share.entity';
import { CreateSacrificeCampaignDto, UpdateSacrificeCampaignDto } from './dto/sacrifice-campaign.dto';
import { CreateSacrificeGroupDto, UpdateSacrificeGroupDto } from './dto/sacrifice-group.dto';
import { CreateSacrificeShareDto, UpdateSacrificeShareDto, BulkCreatePartnerSharesDto, UpdateShareDonorDto } from './dto/sacrifice-share.dto';
import { CurrentAccount, AccountCategory } from '../current-accounts/entities/current-account.entity';

@Injectable()
export class SacrificesService {
  constructor(
    @InjectRepository(SacrificeCampaign)
    private readonly campaignRepo: Repository<SacrificeCampaign>,
    @InjectRepository(SacrificeGroup)
    private readonly groupRepo: Repository<SacrificeGroup>,
    @InjectRepository(SacrificeShare)
    private readonly shareRepo: Repository<SacrificeShare>,
    @InjectRepository(CurrentAccount)
    private readonly currentAccountRepo: Repository<CurrentAccount>,
    private eventEmitter: EventEmitter2,
  ) {}

  // --- CAMPAIGNS ---
  async createCampaign(dto: CreateSacrificeCampaignDto): Promise<SacrificeCampaign> {
    const campaign = this.campaignRepo.create(dto);
    return await this.campaignRepo.save(campaign);
  }

  async findAllCampaigns(): Promise<SacrificeCampaign[]> {
    return await this.campaignRepo.find({ order: { createdAt: 'DESC' } });
  }

  // --- GROUPS ---
  async createGroup(dto: CreateSacrificeGroupDto): Promise<SacrificeGroup> {
    const campaign = await this.campaignRepo.findOne({ where: { id: dto.campaignId } });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');

    const capacity = dto.animalType === SacrificeAnimalType.BUYUKBAS ? 7 : 1;

    const group = this.groupRepo.create({
      ...dto,
      capacity,
      status: SacrificeGroupStatus.BEKLIYOR
    });
    return await this.groupRepo.save(group);
  }

  async findGroupsByCampaign(campaignId: number): Promise<SacrificeGroup[]> {
    return await this.groupRepo.find({
      where: { campaignId },
      relations: { shares: { donor: true, partner: true } },
      order: { createdAt: 'ASC' }
    });
  }

  async findOneGroup(id: number): Promise<SacrificeGroup> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: { shares: { donor: true, partner: true }, campaign: true },
    });
    if (!group) throw new NotFoundException('Grup bulunamadı');
    return group;
  }

  async updateGroup(id: number, dto: UpdateSacrificeGroupDto): Promise<SacrificeGroup> {
    const group = await this.groupRepo.findOne({ where: { id }, relations: { shares: { donor: true, partner: true } } });
    if (!group) throw new NotFoundException('Grup bulunamadı');

    if (dto.animalType && dto.animalType !== group.animalType) {
      const newCapacity = dto.animalType === SacrificeAnimalType.BUYUKBAS ? 7 : 1;
      if (group.shares && group.shares.length > newCapacity) {
        throw new BadRequestException(`Bu grupta ${group.shares.length} adet kayıtlı hisse bulunduğu için türü ${dto.animalType} olarak değiştirilemez.`);
      }
      group.capacity = newCapacity;
    }

    Object.assign(group, dto);

    // Kâr/Zarar Mahsuplaşması (Kesildi veya Aktarıldı durumlarında)
    const isReadyToClose = (group.status === SacrificeGroupStatus.KESILDI || group.status === SacrificeGroupStatus.AKTARILDI);
    
    if (isReadyToClose && !group.isFinanciallyClosed && group.purchaseCosts != null) {
      const incomes: Record<string, number> = {};
      
      if (group.shares && group.shares.length > 0) {
        for (const share of group.shares) {
          const cur = share.currency || 'TRY';
          incomes[cur] = (incomes[cur] || 0) + Number(share.amountPaid || 0);
        }
      }

      const pCosts = group.purchaseCosts || {};
      const sCosts = group.status === SacrificeGroupStatus.AKTARILDI ? {} : (group.slaughterCosts || {});

      const allCurrencies = new Set([...Object.keys(incomes), ...Object.keys(pCosts), ...Object.keys(sCosts)]);

      for (const currency of allCurrencies) {
        const income = incomes[currency] || 0;
        const cost = Number(pCosts[currency] || 0) + Number(sCosts[currency] || 0);
        const difference = income - cost;

        if (difference !== 0) {
          this.eventEmitter.emit('sacrifice.group.closed', {
            groupId: group.id,
            groupName: group.name,
            difference,
            currency,
            status: group.status,
            institution: group.transferredInstitution
          });
        }
      }

      group.isFinanciallyClosed = true;
    }

    return await this.groupRepo.save(group);
  }

  // --- SHARES ---
  async addShare(dto: CreateSacrificeShareDto): Promise<SacrificeShare> {
    // 1. Check Group Capacity
    const group = await this.groupRepo.findOne({ 
      where: { id: dto.groupId },
      relations: { shares: true }
    });

    if (!group) throw new NotFoundException('Hayvan grubu bulunamadı');
    
    if (group.shares.length >= group.capacity) {
      throw new BadRequestException('Bu kurban grubu tamamen dolu (Kapasite aşılamaz)');
    }

    const share = this.shareRepo.create(dto);
    await this.shareRepo.save(share);

    const savedShare = await this.shareRepo.findOne({
      where: { id: share.id },
      relations: { donor: true }
    });

    // Kasa modülü için olay fırlat
    if (savedShare && savedShare.donor && savedShare.amountPaid && Number(savedShare.amountPaid) > 0) {
      this.eventEmitter.emit('sacrifice.share.paid', {
        shareId: savedShare.id,
        donorId: savedShare.donor.id,
        amount: savedShare.amountPaid,
        currency: savedShare.currency,
        description: `Kurban Hissesi Bağışı - ${savedShare.donor.name} (#${savedShare.id})`
      });
    }

    return savedShare!;
  }

  async updateShare(id: number, dto: UpdateSacrificeShareDto): Promise<SacrificeShare> {
    const share = await this.shareRepo.findOne({ where: { id } });
    if (!share) throw new NotFoundException('Hisse bulunamadı');

    Object.assign(share, dto);
    const saved = await this.shareRepo.save(share);
    
    const savedShare = await this.shareRepo.findOne({
      where: { id: saved.id },
      relations: { donor: true }
    });

    // Kasa modülü için olay fırlat
    if (savedShare && savedShare.donor) {
      this.eventEmitter.emit('sacrifice.share.updated', {
        shareId: savedShare.id,
        amount: savedShare.amountPaid,
        currency: savedShare.currency,
        description: `Kurban Hissesi Bağışı - ${savedShare.donor.name} (#${savedShare.id})`
      });
    }

    return savedShare!;
  }

  async removeShare(id: number): Promise<void> {
    const share = await this.shareRepo.findOne({ where: { id } });
    if (!share) throw new NotFoundException('Hisse bulunamadı');

    this.eventEmitter.emit('sacrifice.share.cancelled', {
      shareId: share.id
    });

    await this.shareRepo.remove(share);
  }

  async findSharesByDonor(accountId: number): Promise<SacrificeShare[]> {
    return await this.shareRepo.find({
      where: [
        { donor: { id: accountId } },
        { partner: { id: accountId } }
      ],
      relations: { group: { campaign: true } },
      order: { createdAt: 'DESC' }
    });
  }

  async removeGroup(id: number): Promise<void> {
    const group = await this.groupRepo.findOne({ where: { id }, relations: { shares: true } });
    if (!group) throw new NotFoundException('Grup bulunamadı');
    if (group.shares && group.shares.length > 0) {
      throw new BadRequestException('İçinde hisse bulunan gruplar silinemez. Önce hisseleri silin.');
    }
    await this.groupRepo.remove(group);
  }

  async bulkTransferGroups(groupIds: number[], transferredInstitution: string, purchaseCosts: Record<string, number>): Promise<void> {
    const groups = await this.groupRepo.find({
      where: { id: In(groupIds) },
      relations: { shares: true }
    });

    let totalGroupCount = 0;
    const incomes: Record<string, number> = {};

    for (const group of groups) {
      if (group.status !== SacrificeGroupStatus.AKTARILDI) {
        group.status = SacrificeGroupStatus.AKTARILDI;
        group.transferredInstitution = transferredInstitution;
        group.isFinanciallyClosed = true;
        await this.groupRepo.save(group);
        totalGroupCount++;

        if (group.shares && group.shares.length > 0) {
          for (const share of group.shares) {
            const cur = share.currency || 'TRY';
            incomes[cur] = (incomes[cur] || 0) + Number(share.amountPaid || 0);
          }
        }
      }
    }

    if (totalGroupCount > 0) {
      const allCurrencies = new Set([...Object.keys(incomes), ...Object.keys(purchaseCosts)]);
      for (const currency of allCurrencies) {
        const income = incomes[currency] || 0;
        const cost = Number(purchaseCosts[currency] || 0);
        const difference = income - cost;
        if (difference !== 0) {
          this.eventEmitter.emit('sacrifice.groups.bulk_transferred', {
            groupCount: totalGroupCount,
            difference,
            currency,
            institution: transferredInstitution
          });
        }
      }
    }
  }

  async getCampaignReport(campaignId: number): Promise<any> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');

    const groups = await this.groupRepo.find({
      where: { campaignId },
      relations: { shares: { donor: true } }
    });

    const report = {
      campaign,
      totalGroups: groups.length,
      groupTypes: { buyukbas: 0, kucukbas: 0 },
      groupStatuses: { bekliyor: 0, kesildi: 0, dagitildi: 0, aktarildi: 0 },
      totalShares: 0,
      shareTypes: {} as Record<string, number>,
      donationsByCurrency: {} as Record<string, number>,
      purchaseCostsByCurrency: {} as Record<string, number>,
      slaughterCostsByCurrency: {} as Record<string, number>,
      detailedGroups: groups
    };

    for (const group of groups) {
      if (group.animalType === SacrificeAnimalType.BUYUKBAS) report.groupTypes.buyukbas++;
      else report.groupTypes.kucukbas++;

      if (group.status === SacrificeGroupStatus.BEKLIYOR || !group.status) report.groupStatuses.bekliyor++;
      else if (group.status === SacrificeGroupStatus.KESILDI) report.groupStatuses.kesildi++;
      else if (group.status === SacrificeGroupStatus.DAGITILDI) report.groupStatuses.dagitildi++;
      else if (group.status === SacrificeGroupStatus.AKTARILDI) report.groupStatuses.aktarildi++;

      if (group.purchaseCosts) {
        for (const [cur, amount] of Object.entries(group.purchaseCosts)) {
          report.purchaseCostsByCurrency[cur] = (report.purchaseCostsByCurrency[cur] || 0) + Number(amount);
        }
      }

      if (group.slaughterCosts && group.status !== SacrificeGroupStatus.AKTARILDI) {
        for (const [cur, amount] of Object.entries(group.slaughterCosts)) {
          report.slaughterCostsByCurrency[cur] = (report.slaughterCostsByCurrency[cur] || 0) + Number(amount);
        }
      }

      if (group.shares) {
        report.totalShares += group.shares.length;
        for (const share of group.shares) {
          const type = share.shareType || 'Diğer';
          report.shareTypes[type] = (report.shareTypes[type] || 0) + 1;

          if (share.amountPaid) {
            const cur = share.currency || 'TRY';
            report.donationsByCurrency[cur] = (report.donationsByCurrency[cur] || 0) + Number(share.amountPaid);
          }
        }
      }
    }

    return report;
  }

  // --- PARTNER & SMS ---
  async addBulkPartnerShares(dto: BulkCreatePartnerSharesDto): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: dto.campaignId } });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');

    const partner = await this.currentAccountRepo.findOne({ where: { id: dto.partnerId } });
    if (!partner) {
      throw new BadRequestException('Geçerli bir partner bulunamadı (Cari kaydı yok).');
    }

    for (const shareDto of dto.shares) {
      let donorId: number | null = null;
      if (shareDto.ad_soyad) {
        let currentAccount = await this.currentAccountRepo.findOne({
          where: { name: shareDto.ad_soyad, phone: shareDto.telefon || undefined }
        });

        if (!currentAccount) {
          currentAccount = this.currentAccountRepo.create({
            accountCategory: AccountCategory.BIREYSEL,
            name: shareDto.ad_soyad,
            identityNumber: shareDto.tc_no,
            phone: shareDto.telefon,
            isActive: true
          });
          currentAccount = await this.currentAccountRepo.save(currentAccount);
        }
        donorId = currentAccount.id;
      }

      let group = await this.groupRepo.createQueryBuilder('group')
        .leftJoin('group.shares', 'shares')
        .where('group.campaign_id = :cid', { cid: campaign.id })
        .groupBy('group.id')
        .having('COUNT(shares.id) < group.capacity')
        .getOne();

      if (!group) {
        group = this.groupRepo.create({
          name: `Partner-${partner.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          animalType: SacrificeAnimalType.BUYUKBAS,
          capacity: 7,
          status: SacrificeGroupStatus.BEKLIYOR,
          campaignId: campaign.id
        });
        group = await this.groupRepo.save(group);
      }

      const newShare = this.shareRepo.create({
        donorId: donorId,
        partnerId: partner.id,
        groupId: group.id,
        shareType: shareDto.shareType,
        expectedAmount: shareDto.expectedAmount !== undefined && shareDto.expectedAmount !== null 
          ? Number(shareDto.expectedAmount) 
          : Number(campaign.defaultSharePrice),
        amountPaid: shareDto.amountPaid,
        currency: shareDto.currency || 'TRY',
        isSmsSent: false
      });

      await this.shareRepo.save(newShare);
    }
  }

  async assignDonorToShare(shareId: number, dto: UpdateShareDonorDto): Promise<SacrificeShare> {
    const share = await this.shareRepo.findOne({ where: { id: shareId }, relations: { partner: true } });
    if (!share) throw new NotFoundException('Hisse bulunamadı');

    let currentAccount = await this.currentAccountRepo.findOne({
      where: { name: dto.ad_soyad, phone: dto.telefon || undefined }
    });

    if (!currentAccount) {
      currentAccount = this.currentAccountRepo.create({
        accountCategory: AccountCategory.BIREYSEL,
        name: dto.ad_soyad,
        identityNumber: dto.tc_no,
        phone: dto.telefon,
        isActive: true
      });
      currentAccount = await this.currentAccountRepo.save(currentAccount);
    }

    share.donorId = currentAccount.id;
    return await this.shareRepo.save(share);
  }

  async getPartnerReport(campaignId: number, partnerId: number) {
    const shares = await this.shareRepo.find({
      where: { partnerId, group: { campaignId } },
      relations: { donor: true, group: true }
    });

    let totalBeneficiaries = 0;
    const distributionSummary: Record<string, number> = {};
    const uniqueGroupIds = new Set<number>();
    
    // currency -> { expected, paid, debt }
    const financials: Record<string, { expected: number; paid: number; debt: number }> = {};

    for (const share of shares) {
      const c = share.currency || 'TRY';
      if (!financials[c]) financials[c] = { expected: 0, paid: 0, debt: 0 };
      
      financials[c].expected += Number(share.expectedAmount || 0);
      financials[c].paid += Number(share.amountPaid || 0);

      const group = share.group;
      if (group && group.status === SacrificeGroupStatus.DAGITILDI) {
        if (!uniqueGroupIds.has(group.id)) {
          uniqueGroupIds.add(group.id);
          const loc = group.distributionLocation || 'Bilinmeyen Bölge';
          distributionSummary[loc] = (distributionSummary[loc] || 0) + 1; // Grup sayısı olarak takip edelim
          totalBeneficiaries += Number(group.beneficiaryCount || 0);
        }
      }
    }

    for (const c in financials) {
      financials[c].debt = Math.max(0, financials[c].expected - financials[c].paid);
    }

    return {
      totalShares: shares.length,
      slaughtered: shares.filter(s => s.group?.status === SacrificeGroupStatus.KESILDI || s.group?.status === SacrificeGroupStatus.DAGITILDI).length,
      pending: shares.filter(s => s.group?.status === SacrificeGroupStatus.BEKLIYOR).length,
      financials,
      distributionSummary,
      totalBeneficiaries,
      shares
    };
  }

  async payPartnerDebt(campaignId: number, partnerId: number, dto: { amount: number; currency: string; description?: string }) {
    const shares = await this.shareRepo.find({
      where: { partnerId, group: { campaignId }, currency: dto.currency },
      order: { id: 'ASC' }
    });

    let remainingPayment = Number(dto.amount);
    
    for (const share of shares) {
      if (remainingPayment <= 0) break;
      
      const expected = Number(share.expectedAmount || 0);
      const paid = Number(share.amountPaid || 0);
      const debt = expected - paid;
      
      if (debt > 0) {
        const paymentForThisShare = Math.min(debt, remainingPayment);
        share.amountPaid = paid + paymentForThisShare;
        remainingPayment -= paymentForThisShare;
        await this.shareRepo.save(share);

        this.eventEmitter.emit('sacrifice.share.paid', {
          shareId: share.id,
          donorId: partnerId,
          amount: paymentForThisShare,
          currency: dto.currency || 'TRY',
          description: dto.description || `Partner Toplu Tahsilat - Kısmi Ödeme (Hisse #${share.id})`
        });
      }
    }

    return { success: true, remainingUnusedPayment: remainingPayment };
  }

  async sendSmsToShareholder(shareId: number): Promise<{ success: boolean; message: string }> {
    const share = await this.shareRepo.findOne({ where: { id: shareId }, relations: { donor: true, group: true } });
    if (!share) throw new NotFoundException('Hisse bulunamadı');
    if (!share.donor || !share.donor.phone) {
      throw new BadRequestException('Hisse sahibinin telefon numarası yok');
    }

    // MOCK SMS LOGIC
    console.log(`[SMS MOCK] Sayin ${share.donor.name}, kurbaniniz kesilmistir. Allah kabul etsin.`);
    
    share.isSmsSent = true;
    await this.shareRepo.save(share);

    return { success: true, message: 'SMS başarıyla gönderildi (Mock)' };
  }
}
