import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentService';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocuments() {
      try {
        setDocuments(await listDocuments());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setError('');
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace central</p>
          <h1>Document Management System</h1>
        </div>
        <div className="status-pill">{documents.length} documento{documents.length === 1 ? '' : 's'}</div>
      </header>

      <UploadComponent onUploaded={handleUploaded} />

      {error && (
        <p className="status-banner status-banner--error" role="alert">
          {error}
        </p>
      )}

      <DocumentList documents={documents} isLoading={isLoading} />
    </main>
  );
}
