const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento pela API /api', async () => {
  const storageDirectory = path.resolve(__dirname, '../storage');
  const server = app.listen(0);
  const { port } = await new Promise((resolve) => {
    server.once('listening', () => resolve(server.address()));
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  const form = new FormData();
  form.append('file', new Blob(['conteudo seguro'], { type: 'text/plain' }), 'nota.txt');

  try {
    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: form
    });
    assert.equal(uploadResponse.status, 201);

    const uploaded = await uploadResponse.json();
    assert.equal(uploaded.originalName, 'nota.txt');
    assert.equal('storagePath' in uploaded, false);
    assert.equal('storedName' in uploaded, false);

    const listResponse = await fetch(`${baseUrl}/api/documents`);
    assert.equal(listResponse.status, 200);
    const documents = await listResponse.json();
    assert.equal(documents.some((document) => document.id === uploaded.id), true);

    const downloadResponse = await fetch(`${baseUrl}/api/documents/${uploaded.id}/download`);
    assert.equal(downloadResponse.status, 200);
    assert.equal(await downloadResponse.text(), 'conteudo seguro');
  } finally {
    for (const fileName of fs.readdirSync(storageDirectory)) {
      if (fileName !== '.gitkeep') {
        fs.rmSync(path.join(storageDirectory, fileName), { force: true });
      }
    }
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejeita extensões de credencial no upload', async () => {
  const storageDirectory = path.resolve(__dirname, '../storage');
  const server = app.listen(0);
  const { port } = await new Promise((resolve) => {
    server.once('listening', () => resolve(server.address()));
  });
  const form = new FormData();
  form.append('file', new Blob(['keystore'], { type: 'application/octet-stream' }), 'secrets.jks');

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/upload`, {
      method: 'POST',
      body: form
    });
    assert.equal(response.status, 400);
  } finally {
    for (const fileName of fs.readdirSync(storageDirectory)) {
      if (fileName !== '.gitkeep') {
        fs.rmSync(path.join(storageDirectory, fileName), { force: true });
      }
    }
    await new Promise((resolve) => server.close(resolve));
  }
});
