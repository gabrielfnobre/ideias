<?php
declare(strict_types=1);

namespace Ideias;

use PDO;
use PDOException;

/**
 * Classe Kernel
 *
 * Esta é a classe principal da API, responsável por toda a lógica do sistema.
 * Aqui você encontrará métodos de autenticação, manipulação de ideias, campanhas, votos,
 * comentários, badges, integração com OAuth, operações com banco de dados, dashboard, etc.
 *
 * Se for fazer alterações, LEIA e MANTENHA OS COMENTÁRIOS para facilitar a compreensão de outros desenvolvedores.
 * É fundamental prezar pela clareza nas documentações para manutenção futura.
 */
class Kernel
{
    /** @var PDO $db Conexão principal com o banco de dados via PDO. */
    private PDO $db;
    private PDO $db_aplicacao_db;

    /**
     * Construtor da classe (principal, padrão).
     * - Estabelece a conexão com o banco de dados.
     * - Executa/migra estrutura do banco se necessário.
     * - Inicia a sessão PHP de forma segura.
     * - Garante a existência da pasta para armazenar arquivos de mails localmente.
     */
    public function __construct()
    {
        $this->db = $this->connect(); // Conecta ao banco de dados padrão.
        $this->migrate();             // Atualiza/cria estrutura do banco.
        $this->setupSession();        // Inicia sessão segura.
        if (!is_dir(__DIR__ . '/../storage/mails')) {
            @mkdir(__DIR__ . '/../storage/mails', 0777, true); // Cria diretório de emails, se não existir.
        }
    }

    /**
     * Cria e retorna uma conexão PDO com o banco MySQL utilizando dados das variáveis de ambiente.
     * Se o banco especificado não existir, será criado automaticamente pela função.
     * Retorna (PDO) em caso de sucesso, ou encerra a execução com erro JSON e código HTTP 500.
     */
    private function connect(): PDO
    {
        //================================================
        // PRODUTION'S DB
        //================================================
        $host = getenv('DB_HOST') ?: '191.252.181.20';
        $port = getenv('DB_PORT') ?: '3306';
        $user = getenv('DB_USER') ?: 'inovacao';
        $pass = getenv('DB_PASS') ?: 'Inovacao@2025';
        $dbname = getenv('DB_NAME') ?: 'ideias';
        
        //================================================
        // DEVELOPMENT'S DB
        //================================================
        // $host = getenv('DB_HOST') ?: 'localhost';
        // $port = getenv('DB_PORT') ?: '3306';
        // $user = getenv('DB_USER') ?: 'root';
        // $pass = getenv('DB_PASS') ?: '';
        // $dbname = getenv('DB_NAME') ?: 'ideias';

        try {
            // Conecta ao MySQL sem banco inicialmente para poder criar o banco na sequência.
            $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

            // Cria o banco de dados caso ainda não exista.
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$dbname}`");
            return $pdo;
        } catch (PDOException $e) {
            // Retorna erro estruturado JSON em caso de falha e encerra execução.
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'db_erro_conexao']);
            exit;
        }
    }

    /**
     * Construtor alternativo para conectar em outro banco de dados informando manualmente os parâmetros.
     * Útil para multi-conexão, testes ou integrações.
     *
     * Exemplo de uso:
     * $k = Kernel::withCustomConnection('localhost', '3306', 'root', '', 'ideias');
     *
     * @param string $host
     * @param string $port
     * @param string $user
     * @param string $pass
     * @param string $dbname
     * @param bool $migrate (opcional) Se true, executa migrate() (default: false)
     * @param bool $startSession (opcional) Se true, executa setupSession() (default: false)
     * @return self
     */
    public static function withCustomConnection(
        string $host,
        string $port,
        string $user,
        string $pass,
        string $dbname,
        bool $migrate = false,
        bool $startSession = false
    ): self {
        $instance = new self();
        // Sobrescreve a conexão padrão com os parâmetros customizados.
        $instance->db = $instance->connectCustom($host, $port, $user, $pass, $dbname);

        // Executa migrate e sessão se solicitado
        if ($migrate) {
            $instance->migrate();
        }
        if ($startSession) {
            $instance->setupSession();
        }
        if (!is_dir(__DIR__ . '/../storage/mails')) {
            @mkdir(__DIR__ . '/../storage/mails', 0777, true);
        }
        return $instance;
    }

    /**
     * Conecta ao banco usando credenciais informadas manualmente (utilizada apenas pelo construtor customizado).
     */
    private function connectCustom(string $host, string $port, string $user, string $pass, string $dbname): PDO
    {
        try {
            $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec("USE `{$dbname}`");
            return $pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'db_erro_conexao_custom']);
            exit;
        }
    }

    /**
     * Cria e atualiza todas as tabelas do banco de dados da aplicação.
     * Caso precise alterar a estrutura, adicione no local apropriado e documente a mudança.
     * Esta função é executada automaticamente durante a construção da classe.
     * Exemplos das tabelas: usuários, verificação de e-mail, reset de senha, sessões, campanhas, ideias,
     * votos, comentários, integração OAuth, badges e relação de badges por usuário.
     *
     * Sempre garanta que qualquer alteração importante seja explicada nos comentários abaixo.
     * Também preenche dados básicos caso o sistema esteja vazio (badge e campanhas iniciais).
     */
    private function migrate(): void
    {
        // Tabela de usuários
        $this->db->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NULL,
            password_hash VARCHAR(255) NULL,
            email_verified TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");

        // Tabela para verificar e-mails (tokens)
        $this->db->exec("CREATE TABLE IF NOT EXISTS email_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            INDEX (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela para resetar senhas
        $this->db->exec("CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            INDEX (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela para armazenar sessões autenticadas
        $this->db->exec("CREATE TABLE IF NOT EXISTS sessions (
            id CHAR(64) PRIMARY KEY,
            user_id INT NOT NULL,
            user_agent VARCHAR(255) NULL,
            ip VARCHAR(64) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NULL,
            revoked_at DATETIME NULL,
            INDEX (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela de campanhas para organizar ideias por tema/período
        $this->db->exec("CREATE TABLE IF NOT EXISTS campaigns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            deadline DATE NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'ATIVA',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");

        // Tabela principal: armazena ideias submetidas no sistema
        $this->db->exec("CREATE TABLE IF NOT EXISTS ideas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            campaign_id INT NULL,
            author_id INT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'EM_ELABORACAO',
            score_ai INT NULL,
            compat_ai INT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (campaign_id), INDEX (author_id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB");

        // Tabela de votos em ideias (cada usuário pode votar uma vez por ideia)
        $this->db->exec("CREATE TABLE IF NOT EXISTS idea_votes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            idea_id INT NOT NULL,
            user_id INT NOT NULL,
            type VARCHAR(16) NOT NULL DEFAULT 'up',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_vote (idea_id, user_id),
            FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela de comentários nas ideias (permite árvore com parent_id)
        $this->db->exec("CREATE TABLE IF NOT EXISTS idea_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            idea_id INT NOT NULL,
            user_id INT NOT NULL,
            text TEXT NOT NULL,
            parent_id INT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX (idea_id), INDEX (user_id), INDEX (parent_id),
            FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela de integração com provedores externos (Google OAuth etc)
        $this->db->exec("CREATE TABLE IF NOT EXISTS oauth_identities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            provider VARCHAR(64) NOT NULL,
            provider_user_id VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_provider (provider, provider_user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Tabela de badges/conquistas disponíveis no sistema
        $this->db->exec("CREATE TABLE IF NOT EXISTS badges (
            code VARCHAR(64) PRIMARY KEY,
            label VARCHAR(128) NOT NULL
        ) ENGINE=InnoDB");

        // Tabela que registra quais badges/conquistas cada usuário conquistou
        $this->db->exec("CREATE TABLE IF NOT EXISTS user_badges (
            user_id INT NOT NULL,
            badge_code VARCHAR(64) NOT NULL,
            granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, badge_code),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (badge_code) REFERENCES badges(code) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Preenche badge inicial ("primeira_ideia") se não existir nenhum badge cadastrado
        $seedB = $this->db->query('SELECT COUNT(*) c FROM badges')->fetch();
        if (!$seedB || (int)$seedB['c'] === 0) {
            $this->db->prepare('INSERT INTO badges(code, label) VALUES(?,?)')->execute(['primeira_ideia', 'Primeira Ideia']);
        }

        // Cria duas campanhas padrão, caso ainda não existam campanhas cadastradas
        $exists = $this->db->query('SELECT COUNT(*) c FROM campaigns')->fetch();
        if (!$exists || (int)$exists['c'] === 0) {
            $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)')
                ->execute(['Transformação Digital', 'Automatizar processos e experiência do colaborador', date('Y-m-d', strtotime('+60 days')), 'ATIVA']);
            $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)')
                ->execute(['Eficiência Operacional', 'Redução de custos e ganho de produtividade', date('Y-m-d', strtotime('+90 days')), 'ATIVA']);
        }
    }

    /**
     * Inicia a sessão PHP utilizando configurações seguras.
     * - Ativa modo estrito de sessão.
     * - Configura cookies como "httpOnly" e "SameSite=Strict" para evitar ataques XSS e CSRF.
     * Chame este método antes de acessar quaisquer variáveis de $_SESSION.
     */
    private function setupSession(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            ini_set('session.use_strict_mode', '1');     // Evita reutilização de IDs de sessão
            ini_set('session.cookie_httponly', '1');      // Cookie inacessível para JS
            ini_set('session.cookie_samesite', 'Strict'); // Protege contra CSRF básico
            session_start();
        }
    }

    /**
     * Gera um token aleatório seguro para usos como verificação de e-mail e reset de senha.
     * Por padrão, gera 32 bytes (~43 caracteres base64).
     * Sempre use este método para gerar tokens, nunca rand() ou similares.
     *
     * @param int $bytes Número de bytes de entropia desejado (default 32).
     * @return string Token já codificado.
     */
    private function randToken(int $bytes = 32): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }

    /**
     * Aplica hash SHA-256 no token para armazenamento seguro em banco.
     * Use sempre que precisar comparar ou armazenar tokens sensíveis.
     *
     * @param string $token Token puro original.
     * @return string Hash SHA-256 do token.
     */
    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Aplica hash seguro de senha (bcrypt ou Argon2 se disponível).
     * Sempre utilize este método para salvar senhas, nunca salve senhas puras!
     *
     * @param string $password A senha que será armazenada.
     * @return string Hash seguro da senha.
     */
    private function hashPassword(string $password): string
    {
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        return password_hash($password, $algo);
    }

    /**
     * Realiza cadastro de um novo usuário.
     * Valida dados essenciais (e-mail e senha), impede duplicidade, salva dados e gera token de verificação de e-mail.
     * Link de verificação é salvo em arquivo para acesso no ambiente local.
     *
     * @param string $email Email do novo usuário.
     * @param string $password Senha escolhida.
     * @param string $name (Opcional) Nome do usuário.
     * @return array Resposta estruturada JSON.
     */
    public function signup(string $email, string $password, string $name = ''): array
    {
        if ($email === '' || $password === '') {
            return ['ok' => false, 'error' => 'dados_invalidos'];
        }
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['ok' => false, 'error' => 'email_existente'];
        }
        $hash = $this->hashPassword($password);
        $stmt = $this->db->prepare('INSERT INTO users(email, name, password_hash) VALUES(?,?,?)');
        $stmt->execute([$email, $name ?: null, $hash]);
        $uid = (int)$this->db->lastInsertId();

        // Cria token e salva registro para verificação de e-mail
        $token = $this->randToken();
        $tokenHash = $this->hashToken($token);
        $expires = (new \DateTimeImmutable('+2 hours'))->format('Y-m-d H:i:s');
        $stmt = $this->db->prepare('INSERT INTO email_verifications(user_id, token_hash, expires_at) VALUES(?,?,?)');
        $stmt->execute([$uid, $tokenHash, $expires]);

        // Salva link de verificação em arquivo local para consulta/debug
        $link = 'http://localhost:8000/api/index.php?route=auth/verify&uid=' . $uid . '&token=' . $token;
        file_put_contents(__DIR__ . '/../storage/mails/verification_' . $uid . '.txt', $link);

        return ['ok' => true, 'user' => ['id' => $uid, 'email' => $email], 'verify_link' => $link];
    }

    /**
     * Obtém a foto do usuário (colaborador) a partir do seu REGISTER.
     *
     * Este método consulta a tabela 'collaborators' no banco, buscando o valor do campo USER_PHOTO correspondente
     * ao REGISTER (código do colaborador) informado. 
     *
     * Usado normalmente para exibir o avatar/foto do colaborador no frontend.
     * Retorna erro estruturado caso o registro não exista ou não encontre a foto.
     * 
     * @param string $register Código (REGISTER) único do colaborador.
     * @return array Se houver, retorna array ['ok' => true, 'photo' => string (base64 ou URL)], caso contrário retorna ['ok' => false, 'error' => 'nao_encontrado']
     */
    public function getPhoto(string $register): array
    {
        $stmt = $this->db->prepare('SELECT USER_PHOTO FROM collaborators WHERE REGISTER = ?');
        $stmt->execute([$register]);
        $row = $stmt->fetch();
        if (!$row || empty($row['USER_PHOTO'])) {
            return ['ok' => false, 'error' => 'nao_encontrado'];
        }
        return [
            'ok' => true,
            'photo' => $row['USER_PHOTO']
        ];
    }

    /**
     * Realiza o login de um usuário local via e-mail e senha.
     * Só é autenticado se o e-mail existir e a senha estiver correta.
     * Salva dados básicos do usuário em $_SESSION.
     *
     * @param string $email Email do usuário para login.
     * @param string $password Senha digitada.
     * @return array Resposta com sucesso/erro, dados do usuário e status do e-mail verificado (bool).
     */
    public function login(string $email, string $password): array
    {
        $stmt = $this->db->prepare('SELECT id, password_hash, email_verified, register, name FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if (!$row) {
            return ['ok' => false, 'error' => 'credenciais_invalidas'];
        }
        if (!password_verify($password, (string)$row['password_hash'])) {
            return ['ok' => false, 'error' => 'credenciais_invalidas'];
        }
        $_SESSION['uid'] = (int)$row['id'];
        $_SESSION['name'] = (string)($row['name'] ?? '');
        $_SESSION['email'] = $email;
        $_SESSION['register'] = (string)($row['register'] ?? '');
        return [
            'ok' => true,
            'user' => [
                'id' => (int)$row['id'],
                'email' => $email,
                'name' => (string)($row['name'] ?? ''),
                'register' => (string)($row['register'] ?? ''),
            ],
            'email_verified' => (bool)$row['email_verified'],
        ];
    }

    /**
     * Realiza logout do usuário.
     * Esvazia a sessão de forma segura, destruindo todos os dados de sessão do usuário.
     */
    public function logout(): void
    {
        $_SESSION = [];
        if (session_id() !== '') {
            session_destroy();
        }
    }

    /**
     * Confirma e ativa o e-mail do usuário a partir de um token.
     * - Valida token mais recente do usuário.
     * - Impede reuso de token, tokens expirados ou inválidos.
     * - Marca o e-mail como verificado em caso de sucesso.
     *
     * @param int $uid ID do usuário.
     * @param string $token Token de verificação recebido pelo e-mail.
     * @return array Resposta com sucesso ou motivo da falha.
     */
    public function verifyEmail(int $uid, string $token): array
    {
        $stmt = $this->db->prepare('SELECT id, token_hash, expires_at, used_at FROM email_verifications WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$uid]);
        $row = $stmt->fetch();
        if (!$row) {
            return ['ok' => false, 'error' => 'token_invalido'];
        }
        if ($row['used_at'] !== null) {
            return ['ok' => false, 'error' => 'token_usado'];
        }
        $now = new \DateTimeImmutable();
        if ($now > new \DateTimeImmutable((string)$row['expires_at'])) {
            return ['ok' => false, 'error' => 'token_expirado'];
        }
        if ($this->hashToken($token) !== (string)$row['token_hash']) {
            return ['ok' => false, 'error' => 'token_invalido'];
        }
        // Marca token como usado e valida o e-mail do usuário
        $this->db->prepare('UPDATE email_verifications SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        $this->db->prepare('UPDATE users SET email_verified = 1 WHERE id = ?')->execute([$uid]);
        return ['ok' => true];
    }

    /**
     * Solicita redefinição de senha para o usuário informado.
     * Um token de reset é gerado e salvo em arquivo local (debug/teste).
     * Não expõe se o e-mail existe ou não por motivo de segurança.
     *
     * @param string $email E-mail cadastrado do usuário.
     * @return array Sempre retorna ok, mesmo se o e-mail não existir.
     */
    public function requestPasswordReset(string $email): array
    {
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if (!$row) {
            return ['ok' => true];
        }
        $uid = (int)$row['id'];
        $token = $this->randToken();
        $tokenHash = $this->hashToken($token);
        $expires = (new \DateTimeImmutable('+1 hour'))->format('Y-m-d H:i:s');
        $this->db->prepare('INSERT INTO password_resets(user_id, token_hash, expires_at) VALUES(?,?,?)')->execute([$uid, $tokenHash, $expires]);
        $link = 'http://localhost:8000/reset.html?uid=' . $uid . '&token=' . $token;
        file_put_contents(__DIR__ . '/../storage/mails/reset_' . $uid . '.txt', $link);
        return ['ok' => true];
    }

    /**
     * Efetua o reset da senha do usuário usando token válido.
     * Valida token, verifica prazo e marca como utilizado.
     *
     * @param int $uid ID do usuário.
     * @param string $token Token de reset recebido.
     * @param string $password Nova senha a ser definida.
     * @return array Sucesso/erro e tipo de erro (token inválido/expirado/usado/senha inválida)
     */
    public function resetPassword(int $uid, string $token, string $password): array
    {
        if ($password === '') {
            return ['ok' => false, 'error' => 'senha_invalida'];
        }
        $stmt = $this->db->prepare('SELECT id, token_hash, expires_at, used_at FROM password_resets WHERE user_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$uid]);
        $row = $stmt->fetch();
        if (!$row) {
            return ['ok' => false, 'error' => 'token_invalido'];
        }
        if ($row['used_at'] !== null) {
            return ['ok' => false, 'error' => 'token_usado'];
        }
        $now = new \DateTimeImmutable();
        if ($now > new \DateTimeImmutable((string)$row['expires_at'])) {
            return ['ok' => false, 'error' => 'token_expirado'];
        }
        if ($this->hashToken($token) !== (string)$row['token_hash']) {
            return ['ok' => false, 'error' => 'token_invalido'];
        }
        $hash = $this->hashPassword($password);
        $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $uid]);
        $this->db->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        return ['ok' => true];
    }

    /**
     * Lista todas as campanhas cadastradas no sistema.
     * Retorna array de campanhas com id, título, descrição, deadline e status.
     *
     * @return array Lista de campanhas
     */
    public function listCampaigns(): array
    {
        $rows = $this->db->query('SELECT id, title, description, deadline, status FROM campaigns ORDER BY created_at DESC')->fetchAll();
        return ['ok' => true, 'campaigns' => $rows];
    }

    /**
     * Cria uma nova campanha (um agrupamento de ideias geralmente com prazo).
     * Título é obrigatório, descrição e data limite são opcionais.
     *
     * @param string $title Título da campanha (obrigatório).
     * @param string $description Descrição da campanha.
     * @param string|null $deadline Data limite (YYYY-MM-DD, opcional).
     * @return array Resultado, e id da campanha criada.
     */
    public function createCampaign(string $title, string $description = '', ?string $deadline = null): array
    {
        if ($title === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $stmt = $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)');
        $stmt->execute([$title, $description ?: null, $deadline ?: null, 'ATIVA']);
        return ['ok' => true, 'id' => (int)$this->db->lastInsertId()];
    }

    /**
     * Simula uma "avaliação por IA" da ideia, atribuindo:
     * - score_ai: pontuação calculada pelo tamanho da descrição (mais descrição, score maior, máx 100).
     * - compat_ai: compatibilidade estimada com a campanha (conforme palavras-chave).
     * Este método não utiliza IA real, apenas lógica heurística simples.
     *
     * @param string $title Título da ideia.
     * @param string $description Descrição da ideia.
     * @param int|null $campaignId ID da campanha (se houver).
     * @return array score e compat estimados.
     */
    private function computeAI(string $title, string $description, ?int $campaignId): array
    {
        $compat = 80;
        if ($campaignId) {
            $c = $this->db->prepare('SELECT title FROM campaigns WHERE id = ?');
            $c->execute([$campaignId]);
            $row = $c->fetch();
            if ($row) {
                $t = mb_strtolower((string)$row['title']);
                $txt = mb_strtolower($title . ' ' . $description);
                // Compatibilidade baseada em palavras-chave do campo campanha
                $compat = strpos($txt, 'digital') !== false && strpos($t, 'transformação') !== false ? 100 : 
                         (strpos($txt, 'eficiência') !== false ? 90 : 75);
            }
        }
        $score = min(100, max(30, strlen($description) / 5)); // Score depende do tamanho do texto
        return ['score' => (int)$score, 'compat' => (int)$compat];
    }

    /**
     * Cria uma ideia vinculada ao usuário autenticado.
     * - Só usuários logados podem criar ideias.
     * - Retorna erro se dados estiverem inválidos.
     * - Calcula heurísticas de avaliação inicial (IA simulada).
     * - Concede badge "primeira_ideia" ao usuário, caso seja sua primeira ideia.
     * - Retorna id da ideia criada e scores computados.
     *
     * @param string $title Título da ideia.
     * @param string $description Descrição da ideia.
     * @param int|null $campaignId ID da campanha vinculada (opcional).
     * @return array Resposta indicando sucesso ou tipo de erro, id, score_ai e compat_ai.
     */
    public function createIdea(string $title, string $description, ?int $campaignId): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        if ($title === '' || $description === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $ai = $this->computeAI($title, $description, $campaignId);
        $stmt = $this->db->prepare('INSERT INTO ideas(title, description, campaign_id, author_id, status, score_ai, compat_ai) VALUES(?,?,?,?,?,?,?)');
        $stmt->execute([$title, $description, $campaignId, $_SESSION['uid'], 'EM_ELABORACAO', $ai['score'], $ai['compat']]);
        $id = (int)$this->db->lastInsertId();

        // Futuro: integração com automações externas (Webhook/AI), atualmente comentado.
        // $this->triggerN8NWebhook($id, $title, $description);

        // Badge: concede ao usuário caso seja sua primeira ideia.
        $countStmt = $this->db->prepare('SELECT COUNT(*) c FROM ideas WHERE author_id = ?');
        $countStmt->execute([$_SESSION['uid']]);
        $c = (int)$countStmt->fetch()['c'];
        if ($c === 1) {
            try {
                $this->db->prepare('INSERT INTO user_badges(user_id, badge_code) VALUES(?,?)')
                    ->execute([$_SESSION['uid'], 'primeira_ideia']);
            } catch (\Throwable $e) {
                // Evita exception caso o badge já exista, segura para re-execução.
            }
        }
        return ['ok' => true, 'id' => $id, 'score_ai' => $ai['score'], 'compat_ai' => $ai['compat']];
    }

    /**
     * Método reservado para integração com automações externas através de webhook.
     * Atualmente é apenas um placeholder e não envia dados.
     * Só altere este método se for de fato realizar uma integração.
     *
     * @param int $id ID da ideia.
     * @param string $title Título da ideia.
     * @param string $description Descrição da ideia.
     */
    private function triggerN8NWebhook(int $id, string $title, string $description): void
    {
        // Exemplo de integração externa via webhook ou serviço de automação.
        // $url = 'https://n8n.seu-dominio.com/webhook/...';
        // $data = ['id' => $id, 'title' => $title, 'description' => $description];
        // ... lógica de integração/curl ...
    }

    /**
     * Retorna lista das ideias do sistema, com filtros opcionais:
     * - Campanha
     * - Status
     * - Busca textual (q)
     * O retorno é sempre uma lista ordenada da mais recente para a mais antiga.
     *
     * @param int|null $campaignId Filtrar por campanha específica.
     * @param string|null $status Filtrar por status específico.
     * @param string|null $q Buscar em título/descrição.
     * @return array Lista de ideias encontradas.
     */
    public function listIdeas(?int $campaignId = null, ?string $status = null, ?string $q = null): array
    {
        $sql = 'SELECT i.id, i.title, i.description, i.status, i.score_ai, i.compat_ai, i.created_at, c.title AS campaign, u.name AS author_name FROM ideas i LEFT JOIN campaigns c ON i.campaign_id = c.id LEFT JOIN users u ON i.author_id = u.id WHERE 1=1';
        $params = [];
        if ($campaignId) { $sql .= ' AND i.campaign_id = ?'; $params[] = $campaignId; }
        if ($status) { $sql .= ' AND i.status = ?'; $params[] = $status; }
        if ($q) { $sql .= ' AND (i.title LIKE ? OR i.description LIKE ?)'; $params[] = '%' . $q . '%'; $params[] = '%' . $q . '%'; }
        $sql .= ' ORDER BY i.created_at DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return ['ok' => true, 'ideas' => $stmt->fetchAll()];
    }

    /**
     * Retorna os detalhes completos de uma ideia específica.
     * Traz todos os campos relevantes da ideia e a lista completa de comentários relacionados, ordenados por data.
     *
     * @param int $id ID da ideia buscada.
     * @return array Dados da ideia e comentários, ou erro se não encontrada.
     */
    public function getIdea(int $id): array
    {
        $stmt = $this->db->prepare('SELECT i.id, i.title, i.description, i.status, i.score_ai, i.compat_ai, i.created_at, c.title AS campaign, u.name AS author_name FROM ideas i LEFT JOIN campaigns c ON i.campaign_id = c.id LEFT JOIN users u ON i.author_id = u.id WHERE i.id = ?');
        $stmt->execute([$id]);
        $idea = $stmt->fetch();
        if (!$idea) return ['ok' => false, 'error' => 'nao_encontrado'];
        $cstmt = $this->db->prepare('SELECT id, user_id, text, parent_id, created_at FROM idea_comments WHERE idea_id = ? ORDER BY created_at ASC');
        $cstmt->execute([$id]);
        $comments = $cstmt->fetchAll();
        return ['ok' => true, 'idea' => $idea, 'comments' => $comments];
    }

    /**
     * Registra um voto positivo ("up") na ideia informada.
     * Se o usuário já votou naquela ideia, ignora silenciosamente.
     * Retorna sempre o total de votos atual para a ideia após a operação.
     * Apenas usuários logados podem votar em ideias.
     *
     * @param int $id ID da ideia a receber o voto.
     * @return array ok e número de votos atualizados, ou motivo do erro.
     */
    public function voteIdea(int $id): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        try {
            $this->db->prepare('INSERT INTO idea_votes(idea_id, user_id, type) VALUES(?,?,?)')->execute([$id, $_SESSION['uid'], 'up']);
        } catch (\Throwable $e) {
            // Silencioso: ignora falha por voto duplicado.
        }
        $count = $this->db->prepare('SELECT COUNT(*) c FROM idea_votes WHERE idea_id = ?');
        $count->execute([$id]);
        $c = $count->fetch();
        return ['ok' => true, 'votes' => (int)$c['c']];
    }

    /**
     * Retorna o número de vezes que um determinado id de ideia aparece na coluna idea_id da tabela idea_votes.
     *
     * @param int $id ID da ideia a contar na tabela de votos.
     * @return int Quantidade de ocorrências de $id em idea_votes.idea_id
     */
    public function countVotesForIdea(int $id): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) as total FROM idea_votes WHERE idea_id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return (int)($row['total'] ?? 0);
    }

    /**
     * Adiciona um novo comentário em uma ideia.
     * - Apenas usuários logados podem comentar.
     * - Permite comentários em resposta a outros comentários (parent_id opcional).
     * - Retorna os dados completos da ideia, já com o comentário incluso.
     *
     * @param int $id ID da ideia.
     * @param string $text Texto do comentário.
     * @param int|null $parentId (Opcional) ID do comentário pai.
     * @return array Dados da ideia já com o novo comentário inserido, ou erro.
     */
    public function commentIdea(int $id, string $text, ?int $parentId = null): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        if ($text === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $this->db->prepare('INSERT INTO idea_comments(idea_id, user_id, text, parent_id) VALUES(?,?,?,?)')
            ->execute([$id, $_SESSION['uid'], $text, $parentId]);
        return $this->getIdea($id);
    }

    /**
     * Recupera as informações básicas de um usuário pelo seu ID.
     * Retorna um array associativo com as chaves 'id', 'email' e 'name'.
     *
     * @param int $uid ID do usuário.
     * @return array|null Array associativo ou null se não encontrado.
     */
    public function getUserById(int $uid): ?array
    {
        $stmt = $this->db->prepare('SELECT id, email, name FROM users WHERE id = ?');
        $stmt->execute([$uid]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$user) {
            return null;
        }
        return $user;
    }

    /**
     * Retorna um array associativo com informações dos comentários de uma ideia específica,
     * onde a chave é o user_id (autor) e o valor é um array com 'text' e 'created_at' do comentário.
     *
     * @param int $id ID da ideia.
     * @return array Array associativo user_id => ['text' => ..., 'created_at' => ...]
     */
    public function listCommentsTextsByIdea(int $id): array
    {
        $stmt = $this->db->prepare('SELECT user_id, text, created_at FROM idea_comments WHERE idea_id = ? ORDER BY created_at ASC');
        $stmt->execute([$id]);
        $comments = $stmt->fetchAll();
        $result = [];
        foreach ($comments as $row) {
            $result[$row['user_id']] = [
                'text' => $row['text'],
                'created_at' => $row['created_at']
            ];
        }
        return $result;
    }

    /**
     * Lista todos os badges conquistados por um usuário.
     * Inclui código e nome do badge e data em que foi concedido.
     *
     * @param int $uid ID do usuário.
     * @return array Lista de badges conquistados.
     */
    public function listBadgesForUser(int $uid): array
    {
        $stmt = $this->db->prepare('SELECT b.code, b.label, ub.granted_at FROM user_badges ub INNER JOIN badges b ON ub.badge_code = b.code WHERE ub.user_id = ? ORDER BY ub.granted_at ASC');
        $stmt->execute([$uid]);
        return ['ok' => true, 'badges' => $stmt->fetchAll()];
    }

    /**
     * Retorna ranking dos 10 usuários mais engajados.
     * Ordena pelo número de votos recebidos em suas ideias e quantidade de ideias publicadas.
     * Empate é resolvido pelo maior número de ideias.
     *
     * @return array Lista dos top 10 líderes (id, nome/email, ideias, votos recebidos).
     */
    public function leaderboard(): array
    {
        $rows = $this->db->query('SELECT u.id, COALESCE(u.name, u.email) as name, 
            (SELECT COUNT(*) FROM ideas i WHERE i.author_id = u.id) AS ideas_count,
            (SELECT COUNT(*) FROM idea_votes v INNER JOIN ideas i2 ON v.idea_id = i2.id WHERE i2.author_id = u.id) AS votes_received
            FROM users u ORDER BY votes_received DESC, ideas_count DESC LIMIT 10')->fetchAll();
        return ['ok' => true, 'leaders' => $rows];
    }

    /**
     * Gera estatísticas principais do dashboard do sistema.
     * Traz KPIs (ideias totais, total de votos, taxa de aprovação) e dados para gráficos (por status, por campanha, evolução 30 dias).
     * Apenas usuários autenticados têm acesso.
     *
     * @return array Dados completos para dashboard: KPIs e gráficos.
     */
    public function dashboardStats(): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];

        // KPIs principais
        $totalIdeas = $this->db->query('SELECT COUNT(*) c FROM ideas')->fetch()['c'];
        $totalVotes = $this->db->query('SELECT COUNT(*) c FROM idea_votes')->fetch()['c'];
        $approved = $this->db->query("SELECT COUNT(*) c FROM ideas WHERE status = 'APROVADA'")->fetch()['c'];
        $approvalRate = $totalIdeas > 0 ? round(($approved / $totalIdeas) * 100) : 0;

        // Gráfico: distribuição por status de ideia
        $byStatus = $this->db->query('SELECT status, COUNT(*) as count FROM ideas GROUP BY status')->fetchAll();

        // Gráfico: quantidade de ideias por campanha
        $byCampaign = $this->db->query('SELECT c.title, COUNT(i.id) as count FROM campaigns c LEFT JOIN ideas i ON c.id = i.campaign_id GROUP BY c.id, c.title')->fetchAll();

        // Gráfico: evolução das ideias por dia nos últimos 30 dias
        $evolution = $this->db->query("
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM ideas 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        ")->fetchAll();

        return [
            'ok' => true,
            'kpis' => [
                'total_ideas' => $totalIdeas,
                'total_votes' => $totalVotes,
                'approval_rate' => $approvalRate
            ],
            'charts' => [
                'by_status' => $byStatus,
                'by_campaign' => $byCampaign,
                'evolution' => $evolution
            ]
        ];
    }

    /**
     * Atualiza o status de uma ideia específica.
     * Status padrão: "EM_ELABORACAO", "EM_TRIAGEM", "APROVADA", "REJEITADA", entre outros.
     *
     * @param int $id ID da ideia.
     * @param string $status Novo status a ser atribuído.
     * @return array ok em caso de sucesso.
     */
    public function updateIdeaStatus(int $id, string $status): array
    {
        $stmt = $this->db->prepare("UPDATE ideas SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        return ['ok' => true];
    }
    
    /**
     * Atualiza o status de uma ideia específica.
     * Status padrão: "EM_ELABORACAO", "EM_TRIAGEM", "APROVADA", "REJEITADA", entre outros.
     *
     * @param int $id ID da ideia.
     * @param string $status Novo status a ser atribuído.
     * @return array ok em caso de sucesso.
     */
    public function update_register(int $id, string $register): array
    {
        $stmt = $this->db->prepare("UPDATE users SET register = :register WHERE id = :id");
        $stmt->execute([':register' => $register, ':id' => $id]);
        $row = $stmt->fetch();
        $_SESSION['register'] = (string)($row['register'] ?? '');
        return ['ok' => true];
    }

    /**
     * Atualiza campos específicos de uma ideia (título, descrição).
     * Recebe array contendo o id obrigatório e apenas os campos que devem ser alterados.
     * Não permite atualização se não houver campos válidos.
     *
     * @param array $payload Array com 'id', e pelo menos 'title' e/ou 'description'
     * @return array ok se sucesso ou motivo do erro.
     */
    public function updateIdea(array $payload): array
    {
        if (!isset($payload['id'])) return ['ok' => false, 'error' => 'missing_id'];

        $fields = [];
        $params = [':id' => $payload['id']];

        if (isset($payload['title'])) {
            $fields[] = "title = :title";
            $params[':title'] = $payload['title'];
        }
        if (isset($payload['description'])) {
            $fields[] = "description = :description";
            $params[':description'] = $payload['description'];
        }

        if (empty($fields)) return ['ok' => false, 'error' => 'no_fields'];

        $sql = "UPDATE ideas SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['ok' => true];
    }

    /**
     * Realiza login com autenticação de token Google OAuth2 válido.
     * - Valida o token junto à Google.
     * - Cria usuário no banco caso ainda não exista.
     * - Relaciona a identidade OAuth ao usuário.
     * - Salva sessão do usuário.
     * Não tente customizar ou burlar o fluxo: use sempre o token oficial da Google.
     *
     * @param string $idToken Token de autenticação JWT do Google recebido no front-end.
     * @return array Dados do usuário e sucesso, ou erro descritivo.
     */
    public function loginWithGoogle(string $idToken): array
    {
        $clientId = getenv('GOOGLE_CLIENT_ID') ?: 'YOUR_GOOGLE_CLIENT_ID';
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
        $raw = @file_get_contents($url);
        if ($raw === false) return ['ok' => false, 'error' => 'token_invalido'];
        $data = json_decode($raw, true) ?: [];
        if (($data['aud'] ?? '') !== $clientId) return ['ok' => false, 'error' => 'aud_invalido'];
        if (!in_array(($data['iss'] ?? ''), ['https://accounts.google.com', 'accounts.google.com'], true)) return ['ok' => false, 'error' => 'iss_invalido'];
        if (!isset($data['email'])) return ['ok' => false, 'error' => 'email_ausente'];

        $email = (string)$data['email'];
        $sub = (string)($data['sub'] ?? '');

        // Busca usuário pelo provider + sub
        $stmt = $this->db->prepare('SELECT u.id, u.name FROM users u INNER JOIN oauth_identities oi ON oi.user_id = u.id WHERE oi.provider = ? AND oi.provider_user_id = ?');
        $stmt->execute(['google', $sub]);
        $row = $stmt->fetch();
        if (!$row) {
            // Busca usuário pelo e-mail (caso já exista por outro meio)
            $uStmt = $this->db->prepare('SELECT id, name FROM users WHERE email = ?');
            $uStmt->execute([$email]);
            $u = $uStmt->fetch();
            if (!$u) {
                // Cria usuário novo automaticamente e verifica e-mail
                $this->db->prepare('INSERT INTO users(email, name, email_verified) VALUES(?,?,?)')->execute([$email, (string)($data['name'] ?? ''), 1]);
                $uid = (int)$this->db->lastInsertId();
            } else {
                $uid = (int)$u['id'];
            }
            // Registra a identidade OAuth vinculada ao usuário
            $this->db->prepare('INSERT INTO oauth_identities(user_id, provider, provider_user_id) VALUES(?,?,?)')->execute([$uid, 'google', $sub]);
            $row = ['id' => $uid, 'name' => (string)($data['name'] ?? '')];
        }
        $_SESSION['uid'] = (int)$row['id'];
        $_SESSION['email'] = $email;
        $_SESSION['name'] = (string)$row['name'];
        return ['ok' => true, 'user' => ['id' => (int)$row['id'], 'email' => $email, 'name' => (string)$row['name']]];
    }

    /**
     * Popula o banco de dados com exemplos de usuários, campanhas e ideias para facilitar testes e demonstração.
     * Não execute em produção.
     * Só executa se o banco tiver até 5 usuários (para evitar duplicidade).
     * Cria exemplos de votos e comentários também, sorteando entre os usuários criados.
     *
     * @return array always ok e mensagem explicando o resultado.
     */
    public function seedDatabase(): array
    {
        // Evita duplicidade: só executa se houver poucos usuários
        $c = $this->db->query('SELECT COUNT(*) c FROM users')->fetch()['c'];
        if ($c > 5) return ['ok' => true, 'message' => 'banco_ja_populado'];

        // Lista de usuários a serem criados (nome, email)
        $users = [
            ['Ana Souza', 'ana@empresa.com'],
            ['Carlos Lima', 'carlos@empresa.com'],
            ['Beatriz Rocha', 'beatriz@empresa.com'],
            ['Daniel Alves', 'daniel@empresa.com'],
            ['Fernanda Torres', 'fernanda@empresa.com']
        ];
        $userIds = [];
        foreach ($users as $u) {
            $this->signup($u[1], '123456', $u[0]);
            $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$u[1]]);
            $userIds[] = $stmt->fetch()['id'];
        }

        // Cria campanhas extras caso não haja nenhuma já criada
        $campaigns = $this->listCampaigns()['campaigns'];
        if (empty($campaigns)) {
            $this->createCampaign('Sustentabilidade', 'Ideias para reduzir impacto ambiental', date('Y-m-d', strtotime('+120 days')));
            $campaigns = $this->listCampaigns()['campaigns'];
        }
        $cIds = array_column($campaigns, 'id');

        // Ideias de exemplo: título, descrição, status
        $ideasData = [
            ['Automatização de Relatórios', 'Criar robô para gerar relatórios mensais automaticamente.', 'EM_ELABORACAO'],
            ['Redução de Copos Plásticos', 'Distribuir canecas para todos os funcionários.', 'EM_TRIAGEM'],
            ['App de Carona Corporativa', 'Facilitar caronas entre colaboradores.', 'EM_AVALIACAO'],
            ['Treinamento em IA', 'Workshop mensal sobre ferramentas de IA.', 'APROVADA'],
            ['Sala de Descompressão', 'Criar espaço com jogos e pufs.', 'REJEITADA'],
            ['Digitalização de Arquivo Morto', 'Escanear documentos antigos para liberar espaço.', 'EM_TRIAGEM'],
            ['Programa de Mentoria', 'Seniores mentorando juniores.', 'APROVADA'],
            ['Horta Comunitária', 'Horta no terraço do prédio.', 'EM_ELABORACAO']
        ];

        foreach ($ideasData as $i => $idea) {
            $uid = $userIds[$i % count($userIds)];
            $cid = $cIds[$i % count($cIds)];
            // Calcula critérios IA para a ideia
            $ai = $this->computeAI($idea[0], $idea[1], $cid);
            $stmt = $this->db->prepare('INSERT INTO ideas(title, description, campaign_id, author_id, status, score_ai, compat_ai, created_at) VALUES(?,?,?,?,?,?,?,?)');
            $created = date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days')); // Simula datas antigas
            $stmt->execute([$idea[0], $idea[1], $cid, $uid, $idea[2], $ai['score'], $ai['compat'], $created]);
            $ideaId = $this->db->lastInsertId();

            // Adiciona votos aleatórios à ideia
            $numVotes = rand(0, 5);
            for ($v = 0; $v < $numVotes; $v++) {
                $voterId = $userIds[rand(0, count($userIds) - 1)];
                try {
                    $this->db->prepare('INSERT INTO idea_votes(idea_id, user_id) VALUES(?,?)')->execute([$ideaId, $voterId]);
                } catch (\Throwable $e) {
                    // Ignora votos duplicados
                }
            }

            // Adiciona comentário de exemplo em parte das ideias
            if (rand(0, 1)) {
                $commenterId = $userIds[rand(0, count($userIds) - 1)];
                $this->db->prepare('INSERT INTO idea_comments(idea_id, user_id, text) VALUES(?,?,?)')->execute([$ideaId, $commenterId, 'Ótima ideia! Apoio totalmente.']);
            }
        }

        return ['ok' => true, 'message' => 'banco_populado_com_sucesso'];
    }
}
