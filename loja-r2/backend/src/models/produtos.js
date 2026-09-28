// Tudo que fala com a tabela products fica aqui.
const db = require('../db');

// Traduz uma linha do banco para o formato que o frontend usa.
const paraApi = row => ({
  id: row.id,
  name: row.name,
  cat: row.category,
  mat: row.material,
  price: row.price_cents / 100,
  stock: row.stock,
});

const listar = () =>
  db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY id').all().map(paraApi);

const buscar = id => {
  const row = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(id);
  return row ? paraApi(row) : null;
};

module.exports = { listar, buscar };
