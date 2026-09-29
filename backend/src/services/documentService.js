const crypto = require('node:crypto');
const createServiceError = require('./createServiceError');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  createDocument(file, owner = 'default-user') {
    if (!file) {
      throw createServiceError('Arquivo é obrigatório', 400);
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      storagePath: file.path,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'default-user',
      mimeType: file.mimetype
    };

    return this.documentRepository.save(document);
  }

  listDocuments() {
    return this.documentRepository.findAll().map(({ storedName, storagePath, ...document }) => document);
  }
}

module.exports = DocumentService;
