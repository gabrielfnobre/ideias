# Objetivo
Entregar o site completo da Central de Ideias com cadastro/login, gestão de campanhas e ideias, colaboração, avaliação por IA e recursos elogiados pelos usuários em plataformas líderes.

## Pesquisa (referências elogiadas)
- Plataformas líderes valorizadas por usuários: Brightidea, IdeaScale, Spigit, Crowdicity, Aha! Ideas — destacam crowdsourcing, workflows configuráveis, gamificação, analytics, integrações e mobile [scmGalaxy 2025](https://www.scmgalaxy.com/tutorials/top-10-idea-management-tools-in-2025-features-pros-cons-comparison/), [BestDevOps 2025](https://www.bestdevops.com/top-10-idea-management-tools-in-2025-features-pros-cons-comparison/), [DevOpsSchool 2025](https://www.devopsschool.com/blog/top-10-idea-management-tools-in-2025-features-pros-cons-comparison/), [Gartner Peer Insights 2025](https://www.gartner.com/reviews/market/innovation-management-tools), [InnovationCast 2025](https://innovationcast.com/blog/innovation-management-software).
- Padrões elogiados: campanhas (challenges) com prazo e foco, votação/ratings, discussão colaborativa, analytics de impacto, AI para clusterização/similaridade, gamificação (badges/leaderboards), integrações (Slack/Teams/Jira), mobile.

## Escopo do Site
- Público (autenticado):
  - Home: visão geral, destaque de campanhas e progresso.
  - Campanhas: listagem, detalhes, prazo, objetivos e métricas.
  - Ideias: explorar, filtros avançados (status, campanha, tags), busca, ordenação.
  - Nova Ideia: formulário completo com IA (assistência, compatibilidade, duplicidade).
  - Ideia Detalhe: descrição, anexos, comentários, votos, histórico, similaridade por IA.
  - Meu Perfil: dados, segurança, sessões/dispositivos.
  - Notificações: inbox, preferências, assinaturas de campanha.
- Administração:
  - Gestão de campanhas (criar/editar/encerrar), regras e critérios de avaliação.
  - Moderação: revisar ideias, estados (elaboração, triagem, avaliação, aprovado, rejeitado), tags.
  - Painel de analytics: engajamento, ROI, funil por campanha, heatmap de participação.
  - Usuários e permissões: papéis (admin, avaliador, colaborador), convites.

## Funcionalidades-chave (UX elogiada)
- Captura rápida: campo único (email) + conclusão do perfil depois.
- Autosave e rascunho: edição inline e salvamento automático.
- AI Assist: sugestões de título/descrição, estrutura, correções; compatibilidade com campanha; similaridade para evitar duplicidade.
- Votação e comentários: like/upvote, discussões com menções; threads.
- Gamificação: badges (primeira ideia, top contribuidor), leaderboard por período/campanha.
- Filtros poderosos: por status, campanha, autor, tags, período; chips removíveis.
- Acessibilidade e mobile-first; dark mode opcional.
- Integrações (fase 2): Slack/Teams (notificações, submissão), Jira/Azure Boards (ideias aprovadas → épicos), email.

## Arquitetura Técnica
- Front-end: React + Tailwind + Lucide (migrar para Vite + TS para produção), roteamento client-side.
- Back-end: PHP + MySQL (XAMPP), arquitetura em camadas (rotas, serviços, repositórios, entidades), sessões seguras, CSRF.
- IA: serviços locais mock para sugestões e similaridade; depois conectar a provedores internos.
- Segurança: OWASP (rate limiting, lockout progressivo, validações), cookies `HttpOnly/Secure/SameSite`, cabeçalhos `CSP`.

## Banco de Dados (ampliação)
- `users`, `sessions`, `email_verifications`, `password_resets` (já criados).
- `campaigns` (id, título, objetivo, prazo, status, métricas).
- `ideas` (id, título, descrição, campanha_id, autor_id, status, score_ai, compatibilidade_ai, criado_em, atualizado_em).
- `idea_votes` (idea_id, user_id, tipo, criado_em).
- `idea_comments` (id, idea_id, user_id, texto, parent_id, criado_em).
- `idea_tags`/`tags` (muitos-para-muitos), `attachments`.
- `activity_log` (auditoria), `notifications`, `subscriptions`.

## Páginas e Componentes
- Navegação global com busca; breadcrumb; avatar e menu de usuário.
- Listagens com cartões e métricas; tabelas responsivas; paginação/scroll infinito.
- Formulários com estados de loading/erro, validação e ajuda contextual.
- Widgets: AI Sidebar, Similaridade Footer, compatibilidade progressbar.
- Painéis admin com gráficos (bar/line/pie) e filtros.

## Fluxos
- Onboarding com valor imediato: após cadastro, mostrar campanhas em destaque e um tour curto.
- Submissão de ideia com autosave e detecção de similaridade em tempo real.
- Avaliação por triagem: mudar status, adicionar tags/observações, notificar autor.
- Aprovação → integração (Jira/Teams) na fase 2.

## Roadmap de Entrega
1) Expandir backend (campanhas, ideias, votos, comentários, filtros, notificações) e ajustar DB.
2) Implementar UI completa (rotas: Home, Campanhas, Ideias, Nova Ideia, Detalhe, Admin, Perfil).
3) Recursos UX elogiados: autosave, AI assist, similaridade, gamificação básica.
4) Analytics e moderador; exportações CSV.
5) Integrações (Slack/Teams/Jira), passkeys e social login; dark mode.

## Verificação
- Testes manuais e scripts seed; medição de engajamento e tempo até primeira ideia.
- Segurança: rate limit, expiração de tokens, cabeçalhos e sessões.

Se aprovar, inicio a expansão do backend e a implementação das páginas e componentes para entregar o site completo com essas funcionalidades e UX elogiadas.