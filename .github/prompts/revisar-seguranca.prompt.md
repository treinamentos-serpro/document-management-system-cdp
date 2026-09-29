---
description: Procura falhas de segurança nos arquivos gerados, incluindo senhas, tokens, nomes de usuário, dados sensíveis e entradas inseguras.
name: revisar-seguranca
argument-hint: arquivos ou diretório a revisar (opcional; padrão: arquivos gerados na tarefa atual)
agent: agent
---

# Revisão de segurança dos arquivos gerados

Revise os arquivos `${input:alvo:arquivos gerados na tarefa atual}` e procure falhas de segurança. Se o alvo não for informado, inspecione os arquivos criados ou modificados na tarefa atual, incluindo arquivos não rastreados quando aplicável.

## O que procurar

- Senhas, tokens, chaves de API, segredos, cookies e credenciais hardcoded.
- Nomes de usuário, e-mails, IDs, dados pessoais ou informações sensíveis expostos indevidamente.
- Segredos em logs, mensagens de erro, respostas HTTP, comentários ou arquivos de configuração.
- Variáveis de ambiente usadas incorretamente ou com valores padrão perigosos.
- Validação insuficiente de entrada, injeção, path traversal e acesso não autorizado.
- Uploads e downloads inseguros, incluindo nomes de arquivo e tipos de conteúdo não validados.
- Exposição de caminhos internos, stack traces, metadados ou detalhes de infraestrutura.
- Dependências, permissões e configurações que ampliem desnecessariamente a superfície de ataque.
- Problemas de CORS, autenticação, autorização, sessão e transporte quando aplicável.

## Procedimento

1. Identifique os arquivos realmente gerados ou modificados.
2. Leia o código necessário para entender o fluxo de dados.
3. Procure padrões de segredos e dados sensíveis sem copiar valores completos para a saída.
4. Siga entradas externas até armazenamento, logs, respostas ou comandos.
5. Separe vulnerabilidades confirmadas de suspeitas e falsos positivos.
6. Não altere arquivos durante a revisão, salvo solicitação explícita.

## Formato da resposta

Liste primeiro os achados, ordenados por severidade: crítico, alto, médio e baixo.

Para cada achado, informe:

- Severidade.
- Arquivo e linha aproximada.
- Problema e evidência redigida.
- Impacto possível.
- Correção recomendada.

Não revele senhas, tokens ou chaves encontrados. Redija valores como `[REDACTED]` e informe apenas o tipo e a localização. Se não houver achados, diga isso claramente e registre os limites ou lacunas da revisão.
