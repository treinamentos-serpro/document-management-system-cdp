const fs = require('node:fs');
const path = require('node:path');

class FileRepository {
  constructor(storageDirectory) {
    this.storageDirectory = path.resolve(storageDirectory);
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(storedName) {
    const filePath = path.resolve(this.storageDirectory, storedName);
    const relativePath = path.relative(this.storageDirectory, filePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      const error = new Error('Caminho de arquivo inválido');
      error.statusCode = 400;
      throw error;
    }

    return filePath;
  }

  exists(storedName) {
    return fs.existsSync(this.getFilePath(storedName));
  }
}

module.exports = FileRepository;
