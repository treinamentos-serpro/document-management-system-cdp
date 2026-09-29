import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return (
      <section className="panel documents-panel" aria-live="polite">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Arquivos</p>
            <h2>Documentos enviados</h2>
          </div>
        </div>
        <p className="empty-state">Carregando documentos...</p>
      </section>
    );
  }

  if (documents.length === 0) {
    return (
      <section className="panel documents-panel" aria-labelledby="documents-title">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Arquivos</p>
            <h2 id="documents-title">Documentos enviados</h2>
          </div>
        </div>
        <p className="empty-state">Nenhum documento enviado.</p>
      </section>
    );
  }

  return (
    <section className="panel documents-panel" aria-labelledby="documents-title">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Arquivos</p>
          <h2 id="documents-title">Documentos enviados</h2>
        </div>
      </div>

      <ul className="document-list">
        {documents.map((document) => (
          <li key={document.id} className="document-item">
            <div className="document-meta">
              <span className="document-icon">PDF</span>
              <div>
                <strong>{document.originalName}</strong>
                <div className="document-details">
                  <span>{formatFileSize(document.size)}</span>
                  <span>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <DownloadButton document={document} />
          </li>
        ))}
      </ul>
    </section>
  );
}
