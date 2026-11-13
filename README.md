# Controle Financeiro Pessoal

API RESTful (NestJS + MongoDB Atlas) com front-end Mobile First (HTML, CSS e JS) para registrar receitas e despesas,
acompanhar a saúde financeira e refletir sobre gastos por impulso.

Projeto extensionista, alinhado ao **ODS 1** (erradicação da pobreza) e ao **ODS 12** (consumo e produção responsáveis).

## Como executar

```bash
npm install
cp .env.example .env     # preencha MONGODB_URI com a sua string do MongoDB Atlas
npm run start:dev
```

Acesse `http://localhost:3000` (front-end). A API fica em `http://localhost:3000/transacoes`.

## Endpoints

| Método | Rota           | Descrição                                                                        |
|--------|----------------|----------------------------------------------------------------------------------|
| POST   | `/transacoes`  | Cadastra uma receita ou despesa                                                  |
| GET    | `/transacoes`  | Retorna `{ historico, metricas }` (saldoTotal, totalDespesas, totalGastoImpulso) |

Exemplo de corpo do POST:

```json
{ "descricao": "Conta de Luz", "valor": 120.5, "tipo": "despesa", "categoria": "Moradia", "consumoConsciente": true }
```

## Testes

```bash
npm test          # unitários (cálculo das métricas)
npm run test:e2e  # camada HTTP com banco simulado
```

## Estrutura

- `src/transacoes/`: schema, DTO, controller, service e module
- `src/public/`: front-end estático (servido pelo NestJS)
