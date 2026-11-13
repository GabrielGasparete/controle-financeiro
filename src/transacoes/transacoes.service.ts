import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';

export interface Metricas {
  saldoTotal: number;
  totalDespesas: number;
  totalGastoImpulso: number;
}

type TransacaoParaMetricas = Pick<Transacao, 'tipo' | 'valor' | 'consumoConsciente'>;

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<TransacaoDocument>,
  ) {}

  /** Cadastra uma nova receita ou despesa */
  async create(dto: CreateTransacaoDto) {
    return this.transacaoModel.create(dto);
  }

  /** Retorna o histórico (mais recentes primeiro) + métricas processadas no back-end */
  async findAll() {
    const historico = await this.transacaoModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      historico,
      metricas: this.calcularMetricas(historico),
    };
  }

  /** Processa os dados e consolida as métricas financeiras */
  calcularMetricas(transacoes: TransacaoParaMetricas[]): Metricas {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let totalGastoImpulso = 0;

    for (const t of transacoes) {
      if (t.tipo === 'receita') {
        totalReceitas += t.valor;
      } else if (t.tipo === 'despesa') {
        totalDespesas += t.valor;
        // Despesas marcadas como NÃO conscientes (impulso)
        if (t.consumoConsciente === false) {
          totalGastoImpulso += t.valor;
        }
      }
    }

    return {
      saldoTotal: this.arredondar(totalReceitas - totalDespesas),
      totalDespesas: this.arredondar(totalDespesas),
      totalGastoImpulso: this.arredondar(totalGastoImpulso),
    };
  }

  // Evita erros de ponto flutuante (ex.: 0.1 + 0.2)
  private arredondar(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
