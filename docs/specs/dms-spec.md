# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, consultem e baixem documentos armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos via `multipart/form-data`.
- Armazenamento dos arquivos no filesystem local.
- Listagem dos documentos enviados.
- Download de documentos pelo identificador.
- Associação de documentos a um usuário.
- Interface React para upload, listagem e download.
- Metadados mantidos em memória nesta primeira versão.
- API HTTP baseada em Express.

### Fora do escopo

- Armazenamento em nuvem ou provedores externos.
- Versionamento de documentos.
- Edição ou visualização do conteúdo dos arquivos.
- Autenticação e autorização completas.
- Persistência de metadados em banco de dados.
- Compartilhamento entre usuários.
- Exclusão de documentos.
- Busca avançada ou filtros.
- Conversão, preview ou processamento de arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve conseguir enviar um documento. |
| RF-02 | O sistema deve rejeitar uma requisição de upload sem arquivo. |
| RF-03 | O sistema deve gerar um identificador único para cada documento. |
| RF-04 | O sistema deve preservar o nome original do arquivo nos metadados. |
| RF-05 | O sistema deve armazenar o arquivo em `backend/storage`. |
| RF-06 | O sistema deve registrar tamanho, data de upload e proprietário do documento. |
| RF-07 | O usuário deve conseguir listar os documentos disponíveis. |
| RF-08 | O usuário deve conseguir baixar um documento pelo identificador. |
| RF-09 | O sistema deve retornar erro apropriado para documento inexistente. |
| RF-10 | O sistema deve impedir que o identificador recebido permita acesso arbitrário a arquivos fora do diretório de armazenamento. |
| RF-11 | A interface deve exibir estados de carregamento, sucesso e erro. |
| RF-12 | A interface deve permitir selecionar um arquivo e iniciar o upload. |
| RF-13 | A interface deve apresentar os metadados dos documentos listados. |
| RF-14 | A interface deve fornecer uma ação de download para cada documento. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados localmente usando `multer` com `diskStorage`. |
| RNF-02 | O diretório de armazenamento deve ser `backend/storage`. |
| RNF-03 | Os metadados devem ser mantidos em memória nesta fase. |
| RNF-04 | A configuração deve ser feita por variáveis de ambiente quando aplicável. |
| RNF-05 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-06 | O frontend deve usar React, Vite e componentes funcionais com Hooks. |
| RNF-07 | A comunicação do frontend com o backend deve utilizar `fetch` pelo prefixo `/api`. |
| RNF-08 | O backend deve manter o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-09 | As camadas internas não devem depender diretamente de detalhes HTTP. |
| RNF-10 | Erros de entrada, filesystem e recursos inexistentes devem ser tratados explicitamente. |
| RNF-11 | Os testes do backend devem usar o runner nativo `node:test`. |
| RNF-12 | A solução deve evitar dependências e abstrações desnecessárias. |

## 5. Modelo de dados

### Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único e seguro do documento. |
| `originalName` | string | Sim | Nome original informado pelo cliente. |
| `storedName` | string | Sim | Nome interno usado no filesystem. |
| `storagePath` | string | Sim | Caminho controlado do arquivo armazenado. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload em ISO 8601. |
| `owner` | string | Sim | Identificador do usuário proprietário. |
| `mimeType` | string | Não | Tipo MIME informado pelo upload. |

### Regras do modelo

- `id` deve ser único durante a execução da aplicação.
- `storedName` não deve depender diretamente do nome fornecido pelo usuário.
- `storagePath` deve permanecer dentro de `backend/storage`.
- `uploadedAt` deve ser gerado pelo servidor.
- `size` deve ser obtido do arquivo recebido, não de entrada manual.
- O proprietário inicial pode ser representado por um identificador simples, enquanto autenticação completa estiver fora do escopo.
- A perda dos metadados após reinicialização é esperada nesta versão.

## 6. Contratos de API

A API deve ser exposta pelo prefixo `/api`.

### POST `/api/upload`

Envia um documento.

#### Requisição

- Content-Type: `multipart/form-data`
- Campo do arquivo: `file`
- Campo opcional: `owner`

#### Resposta de sucesso

- Status: `201 Created`
- Content-Type: `application/json`

```json
{
  "id": "document-id",
  "originalName": "relatorio.pdf",
  "storedName": "document-id.pdf",
  "storagePath": "backend/storage/document-id.pdf",
  "size": 2048,
  "uploadedAt": "2026-09-29T12:00:00.000Z",
  "owner": "default-user",
  "mimeType": "application/pdf"
}
```

#### Erros

- `400 Bad Request`: arquivo ausente ou dados inválidos.
- `413 Payload Too Large`: arquivo excede o limite configurado.
- `500 Internal Server Error`: falha ao gravar o arquivo ou registrar os metadados.

### GET `/api/documents`

Lista os documentos conhecidos pela aplicação.

#### Resposta de sucesso

- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": "document-id",
    "originalName": "relatorio.pdf",
    "size": 2048,
    "uploadedAt": "2026-09-29T12:00:00.000Z",
    "owner": "default-user",
    "mimeType": "application/pdf"
  }
]
```

A resposta não deve expor informações internas desnecessárias, como caminhos absolutos do filesystem.

#### Erros

- `500 Internal Server Error`: falha ao consultar o repositório.

### GET `/api/documents/:id/download`

Baixa o conteúdo binário do documento.

#### Parâmetros

- `id`: identificador do documento.

#### Resposta de sucesso

- Status: `200 OK`
- Content-Type: tipo MIME registrado ou `application/octet-stream`.
- Content-Disposition: `attachment` com o nome original do arquivo.
- Corpo: conteúdo binário do arquivo.

#### Erros

- `400 Bad Request`: identificador inválido.
- `404 Not Found`: documento inexistente ou arquivo não encontrado.
- `500 Internal Server Error`: falha na leitura do arquivo.

### Formato de erro

```json
{
  "error": "Mensagem descritiva do erro"
}
```

## 7. Arquitetura

### Backend

A implementação deve respeitar o fluxo:

```text
routes -> controllers -> services -> repositories
```

- `routes/`: registra endpoints, middleware de upload e encaminhamento.
- `controllers/`: interpreta requisições, valida entradas básicas e monta respostas HTTP.
- `services/`: aplica regras de negócio e coordena upload, listagem e download.
- `repositories/`: mantém os metadados em memória e encapsula operações de filesystem necessárias.
- `storage/`: contém os arquivos enviados.

O `multer` deve ser configurado com `diskStorage` na borda HTTP, mantendo detalhes de transporte fora das regras de negócio.

### Frontend

- `pages/`: telas principais.
- `components/`: formulário de upload, lista e item de documento.
- `services/`: chamadas HTTP para a API.
- `App.jsx`: composição da aplicação.

## 8. Plano de execução

### Etapa 1 - Preparação e contratos

Arquivos previstos:

- `docs/specs/dms-spec.md`
- `backend/package.json`
- `frontend/package.json`

Atividades:

- Confirmar dependências existentes.
- Definir limite de upload e variáveis de ambiente.
- Confirmar formato dos metadados e erros.
- Definir critérios de aceite dos endpoints.

Critérios de aceite:

- Contratos de API documentados.
- Responsabilidades das camadas definidas.
- Nenhuma implementação adicional incluída nesta etapa.

### Etapa 2 - Modelo e repositórios do backend

Arquivos previstos:

- `backend/src/repositories/documentRepository.js`
- `backend/src/repositories/fileRepository.js`

Atividades:

- Criar armazenamento em memória dos metadados.
- Encapsular consulta por identificador.
- Encapsular listagem.
- Encapsular leitura e existência de arquivos.
- Garantir caminhos limitados ao diretório de storage.

Critérios de aceite:

- Metadados podem ser inseridos, listados e consultados.
- Arquivos não podem ser acessados fora de `backend/storage`.
- O repositório não depende de Express.

### Etapa 3 - Serviços de negócio

Arquivos previstos:

- `backend/src/services/documentService.js`

Atividades:

- Implementar regras de criação, listagem e download.
- Validar documento encontrado antes do download.
- Coordenar metadados e arquivo físico.
- Definir comportamento para inconsistências entre memória e filesystem.

Critérios de aceite:

- Cada operação possui responsabilidade única.
- O serviço não conhece objetos `req` ou `res`.
- Erros de negócio são distinguíveis de erros HTTP.

### Etapa 4 - Controllers, rotas e configuração do backend

Arquivos previstos:

- `backend/src/controllers/documentController.js`
- `backend/src/routes/documentRoutes.js`
- `backend/src/app.js`

Atividades:

- Configurar `multer.diskStorage`.
- Registrar os endpoints.
- Traduzir entradas e erros para respostas HTTP.
- Configurar o prefixo `/api`.
- Garantir criação ou uso do diretório `backend/storage`.

Critérios de aceite:

- Upload retorna `201`.
- Listagem retorna `200` e array JSON.
- Download retorna conteúdo binário.
- Entradas inválidas e documentos inexistentes retornam os status definidos.

### Etapa 5 - Testes do backend

Arquivos previstos:

- `backend/test/app.test.js`

Atividades:

- Testar upload válido.
- Testar upload sem arquivo.
- Testar listagem.
- Testar download válido.
- Testar download de documento inexistente.
- Testar isolamento do caminho de arquivo.
- Limpar arquivos criados pelos testes.

Critérios de aceite:

- Testes executam com `node:test`.
- Casos de sucesso e erro estão cobertos.
- Os testes não dependem de serviços externos.

### Etapa 6 - Serviços e componentes do frontend

Arquivos previstos:

- `frontend/src/services/documentService.js`
- `frontend/src/components/UploadForm.jsx`
- `frontend/src/components/DocumentList.jsx`
- `frontend/src/components/DocumentItem.jsx`
- `frontend/src/pages/DocumentsPage.jsx`
- `frontend/src/App.jsx`

Atividades:

- Implementar upload via `fetch` e `FormData`.
- Buscar documentos no carregamento da página.
- Exibir metadados.
- Disponibilizar download.
- Tratar carregamento, sucesso, lista vazia e erro.

Critérios de aceite:

- Usuário consegue selecionar e enviar arquivo.
- A lista é atualizada após upload.
- O download usa o identificador correto.
- Erros da API são apresentados de forma compreensível.

### Etapa 7 - Validação integrada

Arquivos previstos:

- `README.md`
- configurações existentes de backend e frontend, somente se necessário.

Atividades:

- Executar testes backend.
- Iniciar backend e frontend.
- Validar fluxo completo de upload, listagem e download.
- Confirmar que o arquivo existe em `backend/storage`.
- Confirmar que reiniciar o backend perde apenas os metadados, conforme especificação.
- Atualizar instruções de execução.

Critérios de aceite:

- Fluxo completo funciona localmente.
- API e frontend usam o prefixo `/api`.
- Não há dependência de armazenamento externo.
- A documentação permite reproduzir a execução.

## 9. Riscos e decisões

- Como os metadados ficam em memória, eles são perdidos ao reiniciar o processo.
- Arquivos podem permanecer no filesystem sem metadados após falhas durante o registro; esse cenário deve ser tratado e documentado.
- Sem autenticação real, o campo `owner` é apenas identificador fornecido ou valor padrão.
- O limite de tamanho deve ser configurável para evitar consumo excessivo de disco.
- O download deve validar o documento pelo repositório antes de ler o arquivo.
- Nenhuma camada interna deve receber diretamente objetos do Express.
