# Loja R2 Gold and Silver

Site de semijoias em ouro 18k e prata 925, com catálogo, sacola e pedidos salvos em banco de dados.

## Como rodar

Requisito: Node.js 20 ou superior.

```bash
cd backend
npm install
npm start
```

Abra http://localhost:3000. Na primeira execução o banco (`backend/data/loja.db`) é criado
e o catálogo inicial é carregado sozinho.

Antes de abrir: copie `LogoR2.jpeg` e `logo.png` para `frontend/assets/`.

## Estrutura

```
loja-r2/
├── frontend/                 o que o cliente vê
│   ├── index.html            estrutura da página
│   ├── css/style.css         visual
│   ├── js/api.js             conversa com o backend (fetch)
│   ├── js/main.js            catálogo, sacola e checkout
│   └── assets/               logos e, depois, fotos dos produtos
│
└── backend/                  regras e dados
    └── src/
        ├── server.js         liga tudo e serve o frontend
        ├── db.js             tabelas do banco (products, orders, order_items)
        ├── seed.js           catálogo inicial (edite preços e estoque aqui)
        ├── routes/           endereços da API (o que cada URL faz)
        ├── models/           consultas ao banco
        └── middleware/       tratamento de erros
```

## API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/produtos` | lista o catálogo com estoque |
| GET | `/api/produtos/:id` | detalhe de um produto |
| POST | `/api/pedidos` | cria um pedido (valida, confere estoque, baixa estoque) |

O servidor recalcula o preço e o total a partir do banco. O navegador só diz
"qual produto e quantas unidades".

## Próximos passos (nesta ordem)

1. Fotos reais dos produtos (campo `image` na tabela + `<img>` no card)
2. Painel para você ver os pedidos e mudar o status (exige login de administrador)
3. Pagamento real (Mercado Pago, em modo de teste primeiro)
4. Migrar o frontend para React, se o site passar de uma página
5. Publicar (Render, Railway ou uma VPS)
