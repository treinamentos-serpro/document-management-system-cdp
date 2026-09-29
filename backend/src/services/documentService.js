const crypto = require('node:crypto');

class DocumentService {
  constructor(documentRepository, fileRepository) {
    this.documentRepository = documentRepository;
    this.fileRepository = fileRepository;
  }

  createDocument(file, owner = 'default-user') {
    if (!file) {
      const error = new Error('Arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
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

  getDocumentDownload(id) {
    if (!id) {
      const error = new Error('Identificador do documento é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const document = this.documentRepository.findById(id);

    if (!document || !this.fileRepository.exists(document.storedName)) {
      const error = new Error('Documento não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      document: this.toPublicDocument(document),
      filePath: this.fileRepository.getFilePath(document.storedName)
    };
  }

  toPublicDocument({ id, originalName, size, uploadedAt, owner, mimeType }) {
    return { id, originalName, size, uploadedAt, owner, mimeType };
  }
}

module.exports = DocumentService;
