import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const document = await uploadDocument(selectedFile);
      onUploaded(document);
      setSelectedFile(null);
      fileInputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="panel upload-panel" aria-labelledby="upload-title">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Arquivo</p>
          <h2 id="upload-title">Enviar documento</h2>
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className={`file-picker ${selectedFile ? 'file-picker--selected' : ''}`}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(event) => setSelectedFile(event.target.files[0] || null)}
            disabled={isUploading}
          />
          <span className="file-picker__label">{selectedFile ? selectedFile.name : 'Escolha um arquivo'}</span>
          <span className="file-picker__action">Procurar</span>
        </label>

        <button className="primary-button" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {error && (
        <p className="form-message form-message--error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
