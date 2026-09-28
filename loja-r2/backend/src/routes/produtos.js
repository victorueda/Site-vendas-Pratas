const router = require('express').Router();
const Produtos = require('../models/produtos');
const { HttpError } = require('../middleware/errors');

router.get('/', (req, res) => {
  res.json(Produtos.listar());
});

router.get('/:id', (req, res) => {
  const p = Produtos.buscar(Number(req.params.id));
  if (!p) throw new HttpError(404, 'Produto não encontrado.');
  res.json(p);
});

module.exports = router;
