/* Comunicação com o backend.
   Toda chamada à API passa por aqui — assim, se o endereço ou o formato mudar,
   você altera em um lugar só. */

async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Sem conexão com o servidor. Tente novamente.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Algo deu errado. Tente novamente.');
  return data;
}

const getProdutos = () => apiFetch('/api/produtos');

const criarPedido = payload =>
  apiFetch('/api/pedidos', { method: 'POST', body: JSON.stringify(payload) });
