const db = require('../db');
const { HttpError } = require('../middleware/errors');

const getProduto = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1');
const insertPedido = db.prepare(`
  INSERT INTO orders (customer_name, phone, cep, address, payment_method, total_cents)
  VALUES (@nome, @telefone, @cep, @endereco, @pagamento, @total_cents)
`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity)
  VALUES (?, ?, ?, ?, ?)
`);
// "AND stock >= ?" garante que duas compras simultâneas não vendam a mesma última peça.
const baixarEstoque = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

// Cria o pedido inteiro ou nada (transação). Preço e total vêm SEMPRE do banco:
// o navegador só informa "qual produto" e "quantas unidades".
const criar = db.transaction(({ cliente, pagamento, itens }) => {
  let total_cents = 0;
  const linhas = itens.map(({ produto_id, quantidade }) => {
    const p = getProduto.get(produto_id);
    if (!p) throw new HttpError(400, 'Um dos produtos da sacola não está mais disponível.');
    total_cents += p.price_cents * quantidade;
    return { p, quantidade };
  });

  const { lastInsertRowid } = insertPedido.run({
    nome: cliente.nome,
    telefone: cliente.telefone,
    cep: cliente.cep || null,
    endereco: cliente.endereco || null,
    pagamento,
    total_cents,
  });

  for (const { p, quantidade } of linhas) {
    const r = baixarEstoque.run(quantidade, p.id, quantidade);
    if (r.changes !== 1) {
      // lançar erro dentro da transação desfaz tudo automaticamente
      throw new HttpError(409, `"${p.name}" não tem estoque suficiente para essa quantidade.`);
    }
    insertItem.run(lastInsertRowid, p.id, p.name, p.price_cents, quantidade);
  }

  return { id: Number(lastInsertRowid), total: total_cents / 100, status: 'pendente' };
});

module.exports = { criar };
