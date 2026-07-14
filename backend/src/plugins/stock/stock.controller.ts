import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('categories')
  getCategories() { return this.stockService.getCategories(); }

  @Post('categories')
  createCategory(@Body() body: any) { return this.stockService.createCategory(body); }

  @Get('items')
  getItems() { return this.stockService.getItems(); }

  @Post('items')
  createItem(@Body() body: any) { return this.stockService.createItem(body); }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() body: any) { return this.stockService.updateItem(+id, body); }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) { return this.stockService.deleteItem(+id); }

  @Get('levels')
  getStockLevels() { return this.stockService.getStockLevels(); }

  @Post('transactions/in')
  stockIn(@Body() body: any) { return this.stockService.stockIn(body); }

  @Post('transactions/out')
  stockOut(@Body() body: any) { return this.stockService.stockOut(body); }

  @Post('transactions/transfer')
  stockTransfer(@Body() body: any) { return this.stockService.stockTransfer(body); }
}
