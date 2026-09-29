const express = require('express');
const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const DocumentRepository = require('../repositories/documentRepository');
const FileRepository = require('../repositories/fileRepository');
const DocumentService = require('../services/documentService');
const DocumentDownloadService = require('../services/documentDownloadService');
const DocumentController = require('../controllers/documentController');

const storageDirectory = path.resolve(__dirname, '../../storage');
const fileRepository = new FileRepository(storageDirectory);
const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
const documentDownloadService = new DocumentDownloadService(documentRepository, fileRepository);
const documentController = new DocumentController(documentService, documentDownloadService);

const storage = multer.diskStorage({
  destination: storageDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024)
  }
});

const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
