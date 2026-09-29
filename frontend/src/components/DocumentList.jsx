import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <section aria-labelledby="documents-title">
      <h2 id="documents-title">Documentos enviados</h2>
      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <strong>{document.originalName}</strong>{' '}
            <span>{formatFileSize(document.size)}</span>{' '}
            <span>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</span>{' '}
            <DownloadButton document={document} />
          </li>
        ))}
      </ul>
    </section>
  );
}
