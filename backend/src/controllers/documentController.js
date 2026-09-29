class DocumentController {
  constructor(documentService, documentDownloadService) {
    this.documentService = documentService;
    this.documentDownloadService = documentDownloadService;

    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this);
  }

  upload(req, res, next) {
    try {
      const document = this.documentService.createDocument(req.file, req.body.owner);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  list(req, res, next) {
    try {
      res.json(this.documentService.listDocuments());
    } catch (error) {
      next(error);
    }
  }

  download(req, res, next) {
    try {
      const { document, filePath } = this.documentDownloadService.getDocumentDownload(req.params.id);
      res.download(filePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentController;
