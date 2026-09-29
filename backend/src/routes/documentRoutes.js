const express = require('express');
const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');

const defaultMaxFileSize = 10 * 1024 * 1024;
const blockedExtensions = new Set([
  '.bat', '.cmd', '.com', '.dll', '.exe', '.jks', '.jar', '.js', '.mjs',
  '.pem', '.ps1', '.sh', '.so'
]);

function getMaxFileSize() {
  const configuredValue = process.env.MAX_FILE_SIZE;

  if (configuredValue === undefined) {
    return defaultMaxFileSize;
  }

  const maxFileSize = Number(configuredValue);

  if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE deve ser um inteiro positivo');
  }

  return maxFileSize;
}

function createUploadMiddleware(storageDirectory) {
  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => {
      callback(null, crypto.randomUUID());
    }
  });

  return multer({
    storage,
    fileFilter: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();

      if (blockedExtensions.has(extension)) {
        const error = new Error('Tipo de arquivo não permitido');
        error.statusCode = 400;
        return callback(error);
      }

      return callback(null, true);
    },
    limits: { fileSize: getMaxFileSize() }
  });
}

function createDocumentRouter({ upload, documentController }) {
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = { createDocumentRouter, createUploadMiddleware };
