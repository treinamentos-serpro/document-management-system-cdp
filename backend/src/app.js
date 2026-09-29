// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const multer = require('multer');
const path = require('node:path');
const DocumentRepository = require('./repositories/documentRepository');
const FileRepository = require('./repositories/fileRepository');
const DocumentService = require('./services/documentService');
const DocumentController = require('./controllers/documentController');
const { createDocumentRouter, createUploadMiddleware } = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const storageDirectory = path.resolve(__dirname, '../storage');
const fileRepository = new FileRepository(storageDirectory);
const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository, fileRepository);
const documentController = new DocumentController(documentService);
const upload = createUploadMiddleware(storageDirectory);
const documentRoutes = createDocumentRouter({ upload, documentController });

// Mantém as rotas antigas e expõe o contrato oficial com prefixo /api.
app.use('/api', documentRoutes);
app.use(documentRoutes);

// Endpoint de verificação de saúde. As demais rotas (/upload, /documents,
// /documents/:id/download) serão implementadas durante o Passo 2.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Arquivo excede o limite permitido'
      : 'Requisição de upload inválida';
    return res.status(statusCode).json({ error: message });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? 'Erro interno do servidor' : error.message;
  return res.status(statusCode).json({ error: message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
