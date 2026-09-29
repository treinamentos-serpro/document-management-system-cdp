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
      document,
      filePath: this.fileRepository.getFilePath(document.storedName)
    };
  }
}

module.exports = DocumentService;
