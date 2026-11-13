import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  // POST /transacoes
  @Post()
  create(@Body() createTransacaoDto: CreateTransacaoDto) {
    return this.transacoesService.create(createTransacaoDto);
  }

  // GET /transacoes -> { historico: [...], metricas: {...} }
  @Get()
  findAll() {
    return this.transacoesService.findAll();
  }
}
