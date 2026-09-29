const fs = require('node:fs');
const path = require('node:path');

class FileRepository {
  constructor(storageDirectory) {
    this.storageDirectory = path.resolve(storageDirectory);
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(storedName) {
    if (!storedName || path.basename(storedName) !== storedName) {
      const error = new Error('Caminho de arquivo inválido');
      error.statusCode = 400;
      throw error;
    }

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
    try {
      const filePath = this.getFilePath(storedName);
      const fileStats = fs.lstatSync(filePath);
      return fileStats.isFile();
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EINVAL') {
        return false;
      }

      throw error;
    }
  }

  remove(storedName) {
    try {
      fs.unlinkSync(this.getFilePath(storedName));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = FileRepository;
