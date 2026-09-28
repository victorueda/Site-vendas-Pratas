const router = require('express').Router();
const Pedidos = require('../models/pedidos');
const { HttpError } = require('../middleware/errors');

const FORMAS_PAGAMENTO = ['pix', 'cartao'];

// Nunca confie no que vem do navegador: valida tudo antes de tocar no banco.
function validar(body) {
  const { cliente, pagamento, itens } = body || {};

  const nome = String(cliente?.nome || '').trim();
  const telefone = String(cliente?.telefone || '').trim();
  if (nome.length < 3 || nome.length > 120) throw new HttpError(400, 'Informe seu nome completo.');
  if (telefone.replace(/\D/g, '').length < 10 || telefone.length > 30)
    throw new HttpError(400, 'Informe um telefone válido com DDD.');
  if (!FORMAS_PAGAMENTO.includes(pagamento)) throw new HttpError(400, 'Forma de pagamento inválida.');

  if (!Array.isArray(itens) || itens.length === 0 || itens.length > 50)
    throw new HttpError(400, 'Sua sacola está vazia.');

  // junta linhas repetidas do mesmo produto
  const porProduto = new Map();
  for (const it of itens) {
    const id = Number(it?.produto_id);
    const qtd = Number(it?.quantidade);
    if (!Number.isInteger(id) || !Number.isInteger(qtd) || qtd < 1 || qtd > 20)
      throw new HttpError(400, 'Item inválido na sacola.');
    porProduto.set(id, (porProduto.get(id) || 0) + qtd);
  }

  return {
    cliente: {
      nome,
      telefone,
      cep: String(cliente?.cep || '').trim().slice(0, 20),
      endereco: String(cliente?.endereco || '').trim().slice(0, 300),
    },
    pagamento,
    itens: [...porProduto].map(([produto_id, quantidade]) => ({ produto_id, quantidade })),
  };
}

router.post('/', (req, res) => {
  const pedido = Pedidos.criar(validar(req.body));
  res.status(201).json(pedido);
});

module.exports = router;
