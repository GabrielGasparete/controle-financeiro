// Dashboard de Saúde Financeira
// Regra do projeto: o front-end NÃO calcula nada; apenas exibe o JSON entregue pela API.

const API_URL = '/transacoes';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const elSaldo = document.getElementById('saldo-total');
const elCardSaldo = document.getElementById('card-saldo');
const elDespesas = document.getElementById('total-despesas');
const elImpulso = document.getElementById('total-impulso');
const elLista = document.getElementById('lista');
const elStatus = document.getElementById('status');

function mostrarMetricas(metricas) {
  elSaldo.textContent = formatoMoeda.format(metricas.saldoTotal);
  elDespesas.textContent = formatoMoeda.format(metricas.totalDespesas);
  elImpulso.textContent = formatoMoeda.format(metricas.totalGastoImpulso);
  // Apenas estilo visual: saldo negativo fica vermelho
  elCardSaldo.classList.toggle('negativo', metricas.saldoTotal < 0);
}

function criarItem(t) {
  const ehImpulso = t.tipo === 'despesa' && t.consumoConsciente === false;

  const li = document.createElement('li');
  li.className = `item item--${t.tipo}${ehImpulso ? ' item--impulso' : ''}`;

  const info = document.createElement('div');
  info.className = 'item__info';

  const titulo = document.createElement('strong');
  titulo.textContent = t.descricao;

  const detalhe = document.createElement('small');
  const data = t.createdAt ? ` • ${formatoData.format(new Date(t.createdAt))}` : '';
  detalhe.textContent = `${t.categoria}${data}`;

  info.append(titulo, detalhe);

  if (t.tipo === 'despesa') {
    const selo = document.createElement('span');
    selo.className = `selo ${ehImpulso ? 'selo--impulso' : 'selo--essencial'}`;
    selo.textContent = ehImpulso ? 'Impulso' : 'Essencial';
    info.append(selo);
  }

  const valor = document.createElement('span');
  valor.className = `item__valor ${t.tipo}`;
  valor.textContent = `${t.tipo === 'receita' ? '+' : '-'} ${formatoMoeda.format(t.valor)}`;

  li.append(info, valor);
  return li;
}

function mostrarHistorico(historico) {
  elLista.replaceChildren();

  if (historico.length === 0) {
    elStatus.textContent = 'Nenhuma transação ainda. Toque em "+ Nova transação" para começar!';
    elStatus.classList.remove('erro');
    elStatus.hidden = false;
    return;
  }

  // A API já devolve os lançamentos mais recentes primeiro
  elLista.append(...historico.map(criarItem));
  elStatus.hidden = true;
}

async function carregarDashboard() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

    const { historico, metricas } = await resposta.json();
    mostrarMetricas(metricas);
    mostrarHistorico(historico);
  } catch (erro) {
    console.error(erro);
    elStatus.textContent = 'Não foi possível carregar os dados. Verifique se o servidor está no ar.';
    elStatus.classList.add('erro');
    elStatus.hidden = false;
  }
}

carregarDashboard();
