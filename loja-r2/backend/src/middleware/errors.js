// Erro "esperado" (ex.: dado inválido, peça esgotada) com o código HTTP certo.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// Qualquer erro cai aqui. Erros inesperados NÃO expõem detalhes pro cliente.
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno. Tente novamente em instantes.' });
}

module.exports = { HttpError, notFound, errorHandler };
