// Conexão com o banco (SQLite = um arquivo só, ótimo pra começar).
// Quando a loja crescer, dá pra migrar pra PostgreSQL mantendo as mesmas tabelas.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'loja.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Preços ficam em CENTAVOS (inteiro). Evita erro de arredondamento com decimais.
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,          -- Anéis, Colares, Brincos, Pulseiras
    material    TEXT    NOT NULL,          -- Ouro 18k, Prata 925
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    active      INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name  TEXT    NOT NULL,
    phone          TEXT    NOT NULL,
    cep            TEXT,
    address        TEXT,
    payment_method TEXT    NOT NULL,       -- pix | cartao
    total_cents    INTEGER NOT NULL,
    status         TEXT    NOT NULL DEFAULT 'pendente',
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Guarda nome e preço NA HORA da compra: se o preço mudar depois, o pedido antigo não muda.
  CREATE TABLE IF NOT EXISTS order_items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id          INTEGER NOT NULL REFERENCES orders(id),
    product_id        INTEGER NOT NULL REFERENCES products(id),
    product_name      TEXT    NOT NULL,
    unit_price_cents  INTEGER NOT NULL,
    quantity          INTEGER NOT NULL CHECK (quantity > 0)
  );
`);

require('./seed')(db);

module.exports = db;
