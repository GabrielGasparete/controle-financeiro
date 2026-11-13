import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Transacao } from '../src/transacoes/schemas/transacao.schema';
import { TransacoesController } from '../src/transacoes/transacoes.controller';
import { TransacoesService } from '../src/transacoes/transacoes.service';

// Teste de ponta a ponta da camada HTTP, usando um "banco" em memória (sem precisar do MongoDB)
describe('Transações (e2e)', () => {
  let app: INestApplication;
  const banco: any[] = [];

  const modelMock = {
    create: jest.fn(async (dto) => {
      const doc = { _id: String(banco.length + 1), ...dto };
      banco.push(doc);
      return doc;
    }),
    find: jest.fn(() => ({
      sort: () => ({ lean: () => ({ exec: async () => [...banco].reverse() }) }),
    })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransacoesController],
      providers: [
        TransacoesService,
        { provide: getModelToken(Transacao.name), useValue: modelMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /transacoes cadastra uma receita', () => {
    return request(app.getHttpServer())
      .post('/transacoes')
      .send({ descricao: 'Salário', valor: 2000, tipo: 'receita', categoria: 'Trabalho', consumoConsciente: true })
      .expect(201);
  });

  it('POST /transacoes cadastra uma despesa por impulso', () => {
    return request(app.getHttpServer())
      .post('/transacoes')
      .send({ descricao: 'Fone', valor: 150, tipo: 'despesa', categoria: 'Lazer', consumoConsciente: false })
      .expect(201);
  });

  it('POST /transacoes rejeita tipo inválido', () => {
    return request(app.getHttpServer())
      .post('/transacoes')
      .send({ descricao: 'X', valor: 10, tipo: 'doacao', categoria: 'Outros' })
      .expect(400);
  });

  it('GET /transacoes devolve historico e metricas', async () => {
    const res = await request(app.getHttpServer()).get('/transacoes').expect(200);
    expect(res.body.historico).toHaveLength(2);
    expect(res.body.metricas).toEqual({
      saldoTotal: 1850,
      totalDespesas: 150,
      totalGastoImpulso: 150,
    });
  });
});
