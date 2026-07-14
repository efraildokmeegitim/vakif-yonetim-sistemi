import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { CreateTransactionDto, TransferFundsDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.createWallet(createWalletDto);
  }

  @Get()
  findAllWallets() {
    return this.walletsService.findAllWallets();
  }

  @Get(':id')
  findOneWallet(@Param('id') id: string) {
    return this.walletsService.findOneWallet(+id);
  }

  @Patch(':id')
  updateWallet(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletsService.updateWallet(+id, updateWalletDto);
  }

  @Delete(':id')
  deleteWallet(@Param('id') id: string) {
    return this.walletsService.deleteWallet(+id);
  }

  // Transactions
  @Post('transaction')
  addTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.walletsService.addTransaction(createTransactionDto);
  }

  @Post('transfer')
  transferFunds(@Body() transferDto: TransferFundsDto) {
    return this.walletsService.transferFunds(transferDto);
  }

  @Get('transactions/all')
  getAllTransactions(
    @Query('walletId') walletId?: string,
    @Query('currentAccountId') currentAccountId?: string
  ) {
    return this.walletsService.getTransactions({
      walletId: walletId ? +walletId : undefined,
      currentAccountId: currentAccountId ? +currentAccountId : undefined
    });
  }

  @Get('transactions/:id')
  getTransaction(@Param('id') id: string) {
    return this.walletsService.getTransaction(+id);
  }

  @Patch('transactions/:id')
  updateTransaction(@Param('id') id: string, @Body() updateDto: Partial<CreateTransactionDto>) {
    return this.walletsService.updateTransaction(+id, updateDto);
  }

  @Delete('transactions/:id')
  deleteTransaction(@Param('id') id: string) {
    return this.walletsService.deleteTransaction(+id);
  }

  // ==================== DOCUMENTS ====================

  @Post('transactions/:id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return cb(new BadRequestException('Sadece resim (jpg, png) ve PDF dosyaları yüklenebilir!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB
    }
  }))
  uploadDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya bulunamadı veya format hatalı.');
    return this.walletsService.addDocument(+id, file);
  }

  @Get('transactions/:id/documents')
  getDocuments(@Param('id') id: string) {
    return this.walletsService.getDocuments(+id);
  }

  @Delete('transactions/documents/:docId')
  deleteDocument(@Param('docId') docId: string) {
    return this.walletsService.deleteDocument(+docId);
  }
}
