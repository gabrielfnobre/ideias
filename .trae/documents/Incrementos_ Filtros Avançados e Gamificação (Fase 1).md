# Objetivo
Evoluir o site com recursos elogiados: filtros avançados, gamificação (badges/leaderboard) e melhorias de navegação/UX. Passkeys e Google login ficam para Fase 2 (exigem credenciais de cliente).

## Entregas Fase 1
- Filtros avançados em Ideias: campanha, status, busca, ordenação.
- Gamificação:
  - Badges: "Primeira Ideia" automático ao criar a primeira ideia.
  - Leaderboard: top contribuidores por ideias e votos.
- UI: páginas e navegação para Leaderboard; exibir badges no topbar.

## Backend
- Tabelas: `badges(code,label)`, `user_badges(user_id,badge_code)`; seed inicial.
- Endpoints:
  - `GET /api/index.php?route=ideas/list` já com filtros; adicionar `sort`.
  - `POST /api/index.php?route=ideas/create` concede badge ao primeiro envio.
  - `GET /api/index.php?route=stats/leaderboard` retorna top usuários (contagem de ideias e votos).
  - `GET /api/index.php?route=badges/list` retorna badges do usuário logado.

## Front-end
- Barra de filtros em "Ideias": selects de status/campanha, busca e ordenação, com atualização dinâmica.
- Página "Leaderboard": listagem dos top contribuidores com contagens.
- Mostrar badges do usuário no topbar.

## Segurança e UX
- Sem mudanças sensíveis; apenas leitura/escrita de dados próprios.
- Mensagens claras, estados de carregamento e responsividade.

## Verificação
- Testes manuais: criação de ideia concede badge; filtros retornam corretamente; leaderboard mostra dados.

## Próxima Fase (depois desta)
- Google login (GIS) e passkeys (WebAuthn), dark mode, analytics e integrações (Slack/Teams/Jira).