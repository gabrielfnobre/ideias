# Objetivo
Criar o sistema completo da Central de Ideias com cadastro/login de usuário e UX de onboarding elogiada, adotando práticas modernas (passwordless/passkeys, social login, formulários mínimos, acessibilidade e segurança robusta).

## Pesquisa (o que os usuários mais elogiam)
- Oferecer múltiplas opções de autenticação lado a lado (email/senha, social login, passkeys, magic link) com UX clara e acessível, alinhado às diretrizes atuais e WCAG 2.2 [Authgear 2025](https://www.authgear.com/post/login-signup-ux-guide).
- Simplificar o cadastro (pedir apenas email inicialmente), adiar dados não essenciais e expor valor imediato após entrar (exemplos: ClickUp, Slack, Notion) [Eleken 2025](https://www.eleken.co/blog-posts/sign-up-flow).
- Passwordless: passkeys (WebAuthn) são elogiadas por remover senhas e aumentar segurança; magic links funcionam bem em usos pontuais, mas não são ideais para logins frequentes [Baytech 2025](https://www.baytechconsulting.com/blog/magic-links-ux-security-and-growth-impacts-for-saas-platforms-2025), [Arengu/Medium](https://medium.com/design-bootcamp/analyzing-5-great-signup-examples-for-the-best-onboarding-flow-ca2b7e90518f), [Medium – Magic Links](https://medium.com/ezid/the-ultimate-guide-to-magic-links-de54556c3c59).

## Funcionalidades de Autenticação (MVP + incrementos)
- MVP:
  - Cadastro com email + senha (medidor de força, requisitos claros, mostrar/ocultar senha).
  - Verificação de email (link único, expira, tentativa limitada).
  - Login com sessão httpOnly, SameSite=Strict, Secure.
  - Recuperação de senha com token de uso único.
  - UX mínima: um campo de email no início; demais dados após entrada (perfil).
- Incrementos elogiados:
  - Passkeys (WebAuthn) como opção preferencial.
  - Social login (Google; opcionalmente Microsoft/GitHub).
  - Magic Link para acessos pontuais/baixa frequência (com salvaguardas de entrega e expiração).
  - 2FA (TOTP) com códigos de recuperação.
  - Gerenciamento de sessões e dispositivos confiáveis.

## Arquitetura
- Front-end: React + Tailwind + Lucide.
  - Fase 1: manter versão CDN (já funcional) para validar UX.
  - Fase 2: migrar para Vite + TypeScript para escalabilidade.
- Back-end: PHP (XAMPP) + MySQL.
  - Router simples (Slim 4 via Composer) ou rotas próprias.
  - Camada de serviços (auth, email, tokens) e repositórios (DAO) com PDO.
- Autenticação:
  - Sessões server-side (cookies httpOnly) + CSRF.
  - Hash: Argon2id (se disponível) senão Bcrypt.
  - Tokens temporários para verificação, reset e magic link (com tentativa e expiração).
  - WebAuthn (passkeys) via biblioteca PHP (ex.: web-auth/webauthn) em fase 2.

## Banco de Dados
- `users` (id, email único, nome, hash_senha, email_verificado, criado_em, atualizado_em).
- `email_verifications` (user_id, token_hash, expira_em, usado_em).
- `password_resets` (user_id, token_hash, expira_em, usado_em).
- `sessions` (id, user_id, user_agent, ip, criado_em, expira_em, revogado_em).
- `oauth_identities` (user_id, provider, provider_user_id, criado_em).
- `webauthn_credentials` (user_id, credential_id, public_key, counter, criado_em) — fase 2.
- `two_factor` (user_id, secret, recovery_codes[]) — fase 2.

## Fluxos do Usuário
- Cadastro rápido: email → link de verificação → completar perfil (nome, depto opcional).
- Login padrão: email/senha → sessão; lembrar dispositivo (opcional).
- Login com passkey: prompt do navegador via WebAuthn → sessão.
- Social login: botão Google → consent → criar conta vinculada (se novo).
- Recuperação: email → token → redefinir senha com requisitos.
- Magic link: solicitar link → abrir no mesmo dispositivo; expiração curta.

## UI/UX Detalhes
- Formulários mínimos, uma coluna, labels claros, estados de foco/erro acessíveis.
- Medidor de força de senha e requisitos em tempo real.
- Botões/links com feedback visual, loading e prevenção de duplo clique.
- Mensagens de erro humanas e específicas; sucesso com confirmação discreta.
- Acessibilidade: ARIA, foco gerenciado, contraste adequado.

## Segurança
- OWASP: rate limiting em login/reset; lockout progressivo após tentativas.
- Cookies `Secure`, `HttpOnly`, `SameSite=Strict`; cabeçalhos `CSP`, `X-Frame-Options`.
- Sanitização/validação (backend), prepared statements, audit básico.
- Tokens aleatórios (CSPRNG), armazenados como hash; janelas de expiração curtas.
- WebAuthn (fase 2) para phishing-resistance; backup 2FA.

## Integração com a Central de Ideias
- Proteger rotas de criação de ideia; mostrar avatar/menú do usuário logado.
- Onboarding pós-cadastro: tour rápido e sugestões na sidebar “Melhore sua ideia!”.

## Roadmap
1) MVP backend (PHP/MySQL): rotas de cadastro, verificação de email, login, logout, recuperação; sessão e CSRF.
2) UI auth (React/Tailwind): páginas e modais; estados de erro/sucesso.
3) Social login (Google) e gestão de sessões.
4) Passkeys (WebAuthn) e 2FA TOTP com recovery codes.
5) Painéis de conta: perfil, segurança, dispositivos, exclusão.

## Verificação
- Testes manuais de fluxos principais; logs de entrega de email.
- Medir taxa de conclusão de cadastro e tempo até primeira ação.
- Testes de segurança (tentativas, expirações, cookies, cabeçalhos).

## Entregáveis
- Backend PHP com endpoints REST e integração MySQL.
- UI de autenticação integrada ao app existente.
- Documentação curta de configuração (env, SMTP, OAuth), e scripts SQL.

Confirma que seguimos este plano? Após sua aprovação, inicio a implementação do MVP de cadastro e login com verificação de email e sessões seguras, seguido da UI completa e dos incrementos elogiados (social login, passkeys, 2FA).