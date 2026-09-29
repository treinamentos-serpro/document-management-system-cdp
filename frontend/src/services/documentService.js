const API_PREFIX = '/api';

async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  let message = 'Não foi possível concluir a operação.';

  try {
    const payload = await response.json();
    message = payload.error || message;
  } catch {
    // Mantém a mensagem padrão quando a API não retorna JSON.
  }

  throw new Error(message);
}

export async function listDocuments() {
  const response = await parseResponse(await fetch(`${API_PREFIX}/documents`));
  return response.json();
}

export async function uploadDocument(file, owner = 'default-user') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await parseResponse(await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData
  }));

  return response.json();
}

export async function downloadDocument(document) {
  const response = await parseResponse(
    await fetch(`${API_PREFIX}/documents/${encodeURIComponent(document.id)}/download`)
  );
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');

  link.href = downloadUrl;
  link.download = document.originalName;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}
