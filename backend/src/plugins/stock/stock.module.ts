import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockItemCategory } from './entities/stock-item-category.entity';
import { StockItem } from './entities/stock-item.entity';
import { StockLevel } from './entities/stock-level.entity';
import { StockTransaction } from './entities/stock-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockItemCategory, StockItem, StockLevel, StockTransaction])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
