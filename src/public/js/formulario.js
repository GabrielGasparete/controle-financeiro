// Formulário de cadastro de transações (POST /transacoes)

const API_URL = '/transacoes';

const form = document.getElementById('form-transacao');
const grupoConsumo = document.getElementById('grupo-consumo');
const botao = document.getElementById('botao-salvar');
const elMensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo) {
  elMensagem.textContent = texto;
  elMensagem.className = `mensagem ${tipo}`;
  elMensagem.hidden = false;
}

// "Essencial x Impulso" só faz sentido para despesas
function atualizarCampoConsumo() {
  const tipo = form.elements['tipo'].value;
  grupoConsumo.hidden = tipo !== 'despesa';
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'tipo') atualizarCampoConsumo();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  elMensagem.hidden = true;

  const descricao = form.elements['descricao'].value.trim();
  const valor = Number(form.elements['valor'].value);
  const tipo = form.elements['tipo'].value;
  const categoria = form.elements['categoria'].value;

  if (!descricao || !(valor > 0) || !categoria) {
    mostrarMensagem('Preencha descrição, um valor maior que zero e a categoria.', 'erro');
    return;
  }

  const corpo = {
    descricao,
    valor,
    tipo,
    categoria,
    // Receitas não são "gasto"; para despesas, "essencial" = consumo consciente
    consumoConsciente: tipo === 'receita' ? true : form.elements['consumo'].value === 'essencial',
  };

  botao.disabled = true;
  botao.textContent = 'Salvando...';

  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      const msg = Array.isArray(erro.message) ? erro.message.join(' • ') : erro.message;
      throw new Error(msg || `Erro ${resposta.status}`);
    }

    form.reset();
    atualizarCampoConsumo();
    mostrarMensagem('Transação salva com sucesso! Veja o resultado no Painel.', 'sucesso');
  } catch (erro) {
    mostrarMensagem(`Não foi possível salvar: ${erro.message}`, 'erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Salvar transação';
  }
});

atualizarCampoConsumo();
