import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Transacao } from './schemas/transacao.schema';
import { TransacoesService } from './transacoes.service';

describe('TransacoesService', () => {
  let service: TransacoesService;

  const docs = [
    { descricao: 'Salário', valor: 3000, tipo: 'receita', categoria: 'Trabalho', consumoConsciente: true },
    { descricao: 'Aluguel', valor: 1200, tipo: 'despesa', categoria: 'Moradia', consumoConsciente: true },
    { descricao: 'Tênis novo', valor: 250.5, tipo: 'despesa', categoria: 'Lazer', consumoConsciente: false },
    { descricao: 'Delivery', valor: 49.9, tipo: 'despesa', categoria: 'Alimentação', consumoConsciente: false },
  ];

  const modelMock = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: () => ({ lean: () => ({ exec: () => Promise.resolve(docs) }) }),
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TransacoesService,
        { provide: getModelToken(Transacao.name), useValue: modelMock },
      ],
    }).compile();

    service = moduleRef.get(TransacoesService);
  });

  it('calcula saldoTotal, totalDespesas e totalGastoImpulso', () => {
    const metricas = service.calcularMetricas(docs as any);
    expect(metricas.totalDespesas).toBe(1500.4);
    expect(metricas.saldoTotal).toBe(1499.6);
    expect(metricas.totalGastoImpulso).toBe(300.4);
  });

  it('retorna métricas zeradas quando não há transações', () => {
    expect(service.calcularMetricas([])).toEqual({
      saldoTotal: 0,
      totalDespesas: 0,
      totalGastoImpulso: 0,
    });
  });

  it('findAll devolve historico e metricas', async () => {
    const resultado = await service.findAll();
    expect(resultado.historico).toHaveLength(4);
    expect(resultado.metricas.saldoTotal).toBe(1499.6);
  });

  it('create delega o cadastro ao model', async () => {
    const dto = { descricao: 'Luz', valor: 120, tipo: 'despesa', categoria: 'Moradia', consumoConsciente: true } as const;
    modelMock.create.mockResolvedValue({ _id: '1', ...dto });
    const salvo = await service.create(dto);
    expect(modelMock.create).toHaveBeenCalledWith(dto);
    expect(salvo).toMatchObject({ descricao: 'Luz' });
  });
});
