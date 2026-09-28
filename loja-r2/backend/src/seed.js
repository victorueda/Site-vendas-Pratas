// Popula o catálogo na primeira execução (só se a tabela estiver vazia).
// Os estoques abaixo são de exemplo — ajuste para a realidade da loja.
const PRODUTOS_INICIAIS = [
  ['Anel Filete Duo',            'Anéis',     'Prata 925', 18900, 10],
  ['Anel Solitário Zircônia',    'Anéis',     'Ouro 18k',  24900, 10],
  ['Colar Ponto de Luz',         'Colares',   'Ouro 18k',  32900, 10],
  ['Colar Corrente Veneziana',   'Colares',   'Prata 925', 27900, 10],
  ['Brinco Argola Texturizada',  'Brincos',   'Prata 925', 15900, 10],
  ['Brinco Ear Cuff',            'Brincos',   'Ouro 18k',  19900, 10],
  ['Pulseira Elos Finos',        'Pulseiras', 'Prata 925', 21900, 10],
  ['Pulseira Tênis Cravejada',   'Pulseiras', 'Ouro 18k',  38900, 10],
];

module.exports = function seed(db) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM products').get();
  if (total > 0) return;

  const insert = db.prepare(
    'INSERT INTO products (name, category, material, price_cents, stock) VALUES (?, ?, ?, ?, ?)'
  );
  db.transaction(() => PRODUTOS_INICIAIS.forEach(p => insert.run(...p)))();
  console.log(`Catálogo inicial criado (${PRODUTOS_INICIAIS.length} produtos).`);
};
