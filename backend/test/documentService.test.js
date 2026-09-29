const { test } = require('node:test');
const assert = require('node:assert/strict');
const DocumentService = require('../src/services/documentService');
const DocumentDownloadService = require('../src/services/documentDownloadService');

test('createDocument saves document metadata and applies the default owner', () => {
  let savedDocument;
  const documentRepository = {
    save(document) {
      savedDocument = document;
      return document;
    }
  };
  const service = new DocumentService(documentRepository);

  const document = service.createDocument({
    originalname: 'report.pdf',
    filename: 'stored-report.pdf',
    path: '/storage/stored-report.pdf',
    size: 42,
    mimetype: 'application/pdf'
  });

  assert.strictEqual(document, savedDocument);
  assert.match(document.id, /^[0-9a-f-]{36}$/);
  assert.strictEqual(document.originalName, 'report.pdf');
  assert.strictEqual(document.storedName, 'stored-report.pdf');
  assert.strictEqual(document.owner, 'default-user');
});

test('createDocument rejects a missing file with a client error', () => {
  const service = new DocumentService({ save: (document) => document });

  assert.throws(
    () => service.createDocument(),
    { message: 'Arquivo é obrigatório', statusCode: 400 }
  );
});

test('listDocuments omits storage implementation details', () => {
  const service = new DocumentService({
    findAll: () => [{
      id: 'document-id',
      originalName: 'report.pdf',
      storedName: 'stored-report.pdf',
      storagePath: '/storage/stored-report.pdf'
    }]
  });

  assert.deepStrictEqual(service.listDocuments(), [{
    id: 'document-id',
    originalName: 'report.pdf'
  }]);
});

test('getDocumentDownload resolves the stored file path', () => {
  const document = { id: 'document-id', storedName: 'stored-report.pdf' };
  const service = new DocumentDownloadService({
    findById: () => document
  }, {
    exists: () => true,
    getFilePath: () => '/storage/stored-report.pdf'
  });

  assert.deepStrictEqual(service.getDocumentDownload('document-id'), {
    document,
    filePath: '/storage/stored-report.pdf'
  });
});

test('getDocumentDownload rejects missing identifiers and documents', () => {
  const service = new DocumentDownloadService({
    findById: () => undefined
  }, {
    exists: () => true,
    getFilePath: () => '/storage/file'
  });

  assert.throws(
    () => service.getDocumentDownload(),
    { message: 'Identificador do documento é obrigatório', statusCode: 400 }
  );
  assert.throws(
    () => service.getDocumentDownload('unknown-id'),
    { message: 'Documento não encontrado', statusCode: 404 }
  );
});
