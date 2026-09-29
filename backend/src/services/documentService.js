const crypto = require('node:crypto');
const createServiceError = require('./createServiceError');

class DocumentService {
  constructor(documentRepository, fileRepository) {
    this.documentRepository = documentRepository;
    this.fileRepository = fileRepository;
  }

  createDocument(file, owner = 'default-user') {
    if (!file) {
      throw createServiceError('Arquivo é obrigatório', 400);
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'default-user',
      mimeType: file.mimetype
    };

    try {
      return this.toPublicDocument(this.documentRepository.save(document));
    } catch (error) {
      this.fileRepository.remove(document.storedName);
      throw error;
    }
  }

  listDocuments() {
    return this.documentRepository.findAll().map((document) => this.toPublicDocument(document));
  }
  toPublicDocument({ id, originalName, size, uploadedAt, owner, mimeType }) {
    return { id, originalName, size, uploadedAt, owner, mimeType };
  }
}

module.exports = DocumentService;
