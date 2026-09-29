const createServiceError = require('./createServiceError');

class DocumentDownloadService {
  constructor(documentRepository, fileRepository) {
    this.documentRepository = documentRepository;
    this.fileRepository = fileRepository;
  }

  getDocumentDownload(id) {
    if (!id) {
      throw createServiceError('Identificador do documento é obrigatório', 400);
    }

    const document = this.documentRepository.findById(id);

    if (!document || !this.fileRepository.exists(document.storedName)) {
      throw createServiceError('Documento não encontrado', 404);
    }

    return {
      document,
      filePath: this.fileRepository.getFilePath(document.storedName)
    };
  }
}

module.exports = DocumentDownloadService;
