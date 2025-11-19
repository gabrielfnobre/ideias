# Objetivo
Adicionar login com Google usando Google Identity Services (GIS), com verificação de `id_token` no backend e vinculação de conta.

## Backend
- Tabela `oauth_identities` (user_id, provider, provider_user_id).
- Endpoint `POST /api/index.php?route=auth/google` que:
  - Recebe `id_token` e valida via `https://oauth2.googleapis.com/tokeninfo`.
  - Verifica `aud` contra `GOOGLE_CLIENT_ID` e `iss`, `exp`.
  - Cria/atualiza usuário com email verificado e sessão.

## Front-end
- Incluir script GIS e um botão “Entrar com Google” no modal de autenticação.
- Ao receber o credential JWT do Google, enviar `id_token` ao backend e autenticar a sessão no app.

## Segurança
- Validação de tokeninfo e comparação de `aud` com `GOOGLE_CLIENT_ID` (env).
- Sessão mantida com cookies `HttpOnly` e `SameSite=Strict` já configurados.

## Verificação
- Teste manual do fluxo: render do botão, obtenção do credential, POST ao backend, criação/entrada do usuário.

Após isso, seguimos com passkeys (WebAuthn) em fase seguinte.