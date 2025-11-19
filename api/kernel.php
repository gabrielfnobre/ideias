<?php
declare(strict_types=1);

namespace Ideias;

use PDO;
use PDOException;

class Kernel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = $this->connect();
        $this->migrate();
        $this->setupSession();
        if (!is_dir(__DIR__ . '/../storage/mails')) {
            @mkdir(__DIR__ . '/../storage/mails', 0777, true);
        }
    }

    private function connect(): PDO
    {
        $host = getenv('DB_HOST') ?: '191.252.181.20';
        $port = getenv('DB_PORT') ?: '3306';
        $user = getenv('DB_USER') ?: 'inovacao';
        $pass = getenv('DB_PASS') ?: 'Inovacao@2025';
        $dbname = getenv('DB_NAME') ?: 'ideias';
        try {
            $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$dbname}`");
            return $pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'db_erro_conexao']);
            exit;
        }
    }

    private function migrate(): void
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NULL,
            password_hash VARCHAR(255) NULL,
            email_verified TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");

        $this->db->exec("CREATE TABLE IF NOT EXISTS email_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            INDEX (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $this->db->exec("CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            INDEX (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

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

        $this->db->exec("CREATE TABLE IF NOT EXISTS campaigns (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            deadline DATE NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'ATIVA',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");

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

        $this->db->exec("CREATE TABLE IF NOT EXISTS oauth_identities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            provider VARCHAR(64) NOT NULL,
            provider_user_id VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_provider (provider, provider_user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $this->db->exec("CREATE TABLE IF NOT EXISTS badges (
            code VARCHAR(64) PRIMARY KEY,
            label VARCHAR(128) NOT NULL
        ) ENGINE=InnoDB");
        $this->db->exec("CREATE TABLE IF NOT EXISTS user_badges (
            user_id INT NOT NULL,
            badge_code VARCHAR(64) NOT NULL,
            granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, badge_code),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (badge_code) REFERENCES badges(code) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $seedB = $this->db->query('SELECT COUNT(*) c FROM badges')->fetch();
        if (!$seedB || (int)$seedB['c'] === 0) {
            $this->db->prepare('INSERT INTO badges(code, label) VALUES(?,?)')->execute(['primeira_ideia', 'Primeira Ideia']);
        }

        $exists = $this->db->query('SELECT COUNT(*) c FROM campaigns')->fetch();
        if (!$exists || (int)$exists['c'] === 0) {
            $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)')
                ->execute(['Transformação Digital', 'Automatizar processos e experiência do colaborador', date('Y-m-d', strtotime('+60 days')), 'ATIVA']);
            $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)')
                ->execute(['Eficiência Operacional', 'Redução de custos e ganho de produtividade', date('Y-m-d', strtotime('+90 days')), 'ATIVA']);
        }
    }

    private function setupSession(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            ini_set('session.use_strict_mode', '1');
            ini_set('session.cookie_httponly', '1');
            ini_set('session.cookie_samesite', 'Strict');
            session_start();
        }
    }

    private function randToken(int $bytes = 32): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    private function hashPassword(string $password): string
    {
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        return password_hash($password, $algo);
    }

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
        $token = $this->randToken();
        $tokenHash = $this->hashToken($token);
        $expires = (new \DateTimeImmutable('+2 hours'))->format('Y-m-d H:i:s');
        $stmt = $this->db->prepare('INSERT INTO email_verifications(user_id, token_hash, expires_at) VALUES(?,?,?)');
        $stmt->execute([$uid, $tokenHash, $expires]);
        $link = 'http://localhost:8000/api/index.php?route=auth/verify&uid=' . $uid . '&token=' . $token;
        file_put_contents(__DIR__ . '/../storage/mails/verification_' . $uid . '.txt', $link);
        return ['ok' => true, 'user' => ['id' => $uid, 'email' => $email], 'verify_link' => $link];
    }

    public function login(string $email, string $password): array
    {
        $stmt = $this->db->prepare('SELECT id, password_hash, email_verified, name FROM users WHERE email = ?');
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
        return ['ok' => true, 'user' => ['id' => (int)$row['id'], 'email' => $email, 'name' => (string)($row['name'] ?? '')], 'email_verified' => (bool)$row['email_verified']];
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (session_id() !== '') {
            session_destroy();
        }
    }

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
        $this->db->prepare('UPDATE email_verifications SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        $this->db->prepare('UPDATE users SET email_verified = 1 WHERE id = ?')->execute([$uid]);
        return ['ok' => true];
    }

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

    public function listCampaigns(): array
    {
        $rows = $this->db->query('SELECT id, title, description, deadline, status FROM campaigns ORDER BY created_at DESC')->fetchAll();
        return ['ok' => true, 'campaigns' => $rows];
    }

    public function createCampaign(string $title, string $description = '', ?string $deadline = null): array
    {
        if ($title === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $stmt = $this->db->prepare('INSERT INTO campaigns(title, description, deadline, status) VALUES(?,?,?,?)');
        $stmt->execute([$title, $description ?: null, $deadline ?: null, 'ATIVA']);
        return ['ok' => true, 'id' => (int)$this->db->lastInsertId()];
    }

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
                $compat = strpos($txt, 'digital') !== false && strpos($t, 'transformação') !== false ? 100 : (strpos($txt, 'eficiência') !== false ? 90 : 75);
            }
        }
        $score = min(100, max(30, strlen($description) / 5));
        return ['score' => (int)$score, 'compat' => (int)$compat];
    }

    public function createIdea(string $title, string $description, ?int $campaignId): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        if ($title === '' || $description === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $ai = $this->computeAI($title, $description, $campaignId);
        $stmt = $this->db->prepare('INSERT INTO ideas(title, description, campaign_id, author_id, status, score_ai, compat_ai) VALUES(?,?,?,?,?,?,?)');
        $stmt->execute([$title, $description, $campaignId, $_SESSION['uid'], 'EM_ELABORACAO', $ai['score'], $ai['compat']]);
        $id = (int)$this->db->lastInsertId();
        
        // ------------------------------------------------------------------
        // PREPARAÇÃO PARA INTEGRAÇÃO N8N (AI FLOW)
        // ------------------------------------------------------------------
        // Fluxo: Webhook (Nova Ideia) -> Gemini (Embedding) -> Vector DB -> Site
        // TODO: Descomentar e configurar quando o N8N estiver pronto.
        // $this->triggerN8NWebhook($id, $title, $description);
        // ------------------------------------------------------------------

        $countStmt = $this->db->prepare('SELECT COUNT(*) c FROM ideas WHERE author_id = ?');
        $countStmt->execute([$_SESSION['uid']]);
        $c = (int)$countStmt->fetch()['c'];
        if ($c === 1) {
            try { $this->db->prepare('INSERT INTO user_badges(user_id, badge_code) VALUES(?,?)')->execute([$_SESSION['uid'], 'primeira_ideia']); } catch (\Throwable $e) {}
        }
        return ['ok' => true, 'id' => $id, 'score_ai' => $ai['score'], 'compat_ai' => $ai['compat']];
    }

    // Placeholder para o Webhook do N8N
    private function triggerN8NWebhook(int $id, string $title, string $description): void
    {
        // $url = 'https://n8n.seu-dominio.com/webhook/...';
        // $data = ['id' => $id, 'title' => $title, 'description' => $description];
        // ... curl logic ...
    }

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

    public function voteIdea(int $id): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        try {
            $this->db->prepare('INSERT INTO idea_votes(idea_id, user_id, type) VALUES(?,?,?)')->execute([$id, $_SESSION['uid'], 'up']);
        } catch (\Throwable $e) {}
        $count = $this->db->prepare('SELECT COUNT(*) c FROM idea_votes WHERE idea_id = ?');
        $count->execute([$id]);
        $c = $count->fetch();
        return ['ok' => true, 'votes' => (int)$c['c']];
    }

    public function commentIdea(int $id, string $text, ?int $parentId = null): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        if ($text === '') return ['ok' => false, 'error' => 'dados_invalidos'];
        $this->db->prepare('INSERT INTO idea_comments(idea_id, user_id, text, parent_id) VALUES(?,?,?,?)')
            ->execute([$id, $_SESSION['uid'], $text, $parentId]);
        return $this->getIdea($id);
    }

    public function listBadgesForUser(int $uid): array
    {
        $stmt = $this->db->prepare('SELECT b.code, b.label, ub.granted_at FROM user_badges ub INNER JOIN badges b ON ub.badge_code = b.code WHERE ub.user_id = ? ORDER BY ub.granted_at ASC');
        $stmt->execute([$uid]);
        return ['ok' => true, 'badges' => $stmt->fetchAll()];
    }

    public function leaderboard(): array
    {
        $rows = $this->db->query('SELECT u.id, COALESCE(u.name, u.email) as name, 
            (SELECT COUNT(*) FROM ideas i WHERE i.author_id = u.id) AS ideas_count,
            (SELECT COUNT(*) FROM idea_votes v INNER JOIN ideas i2 ON v.idea_id = i2.id WHERE i2.author_id = u.id) AS votes_received
            FROM users u ORDER BY votes_received DESC, ideas_count DESC LIMIT 10')->fetchAll();
        return ['ok' => true, 'leaders' => $rows];
    }

    public function dashboardStats(): array
    {
        if (!isset($_SESSION['uid'])) return ['ok' => false, 'error' => 'nao_autenticado'];
        
        // KPIs
        $totalIdeas = $this->db->query('SELECT COUNT(*) c FROM ideas')->fetch()['c'];
        $totalVotes = $this->db->query('SELECT COUNT(*) c FROM idea_votes')->fetch()['c'];
        $approved = $this->db->query("SELECT COUNT(*) c FROM ideas WHERE status = 'APROVADA'")->fetch()['c'];
        $approvalRate = $totalIdeas > 0 ? round(($approved / $totalIdeas) * 100) : 0;

        // Charts Data
        $byStatus = $this->db->query('SELECT status, COUNT(*) as count FROM ideas GROUP BY status')->fetchAll();
        $byCampaign = $this->db->query('SELECT c.title, COUNT(i.id) as count FROM campaigns c LEFT JOIN ideas i ON c.id = i.campaign_id GROUP BY c.id, c.title')->fetchAll();
        
        // Evolution (last 30 days)
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

    public function updateIdeaStatus(int $id, string $status): array
    {
        $stmt = $this->db->prepare("UPDATE ideas SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        return ['ok' => true];
    }

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
        $stmt = $this->db->prepare('SELECT u.id, u.name FROM users u INNER JOIN oauth_identities oi ON oi.user_id = u.id WHERE oi.provider = ? AND oi.provider_user_id = ?');
        $stmt->execute(['google', $sub]);
        $row = $stmt->fetch();
        if (!$row) {
            $uStmt = $this->db->prepare('SELECT id, name FROM users WHERE email = ?');
            $uStmt->execute([$email]);
            $u = $uStmt->fetch();
            if (!$u) {
                $this->db->prepare('INSERT INTO users(email, name, email_verified) VALUES(?,?,?)')->execute([$email, (string)($data['name'] ?? ''), 1]);
                $uid = (int)$this->db->lastInsertId();
            } else { $uid = (int)$u['id']; }
            $this->db->prepare('INSERT INTO oauth_identities(user_id, provider, provider_user_id) VALUES(?,?,?)')->execute([$uid, 'google', $sub]);
            $row = ['id' => $uid, 'name' => (string)($data['name'] ?? '')];
        }
        $_SESSION['uid'] = (int)$row['id'];
        $_SESSION['email'] = $email;
        $_SESSION['name'] = (string)$row['name'];
        return ['ok' => true, 'user' => ['id' => (int)$row['id'], 'email' => $email, 'name' => (string)$row['name']]];
    }
    public function seedDatabase(): array
    {
        // Check if already seeded to avoid mess
        $c = $this->db->query('SELECT COUNT(*) c FROM users')->fetch()['c'];
        if ($c > 5) return ['ok' => true, 'message' => 'banco_ja_populado'];

        // Users
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

        // Campaigns (ensure they exist)
        $campaigns = $this->listCampaigns()['campaigns'];
        if (empty($campaigns)) {
            $this->createCampaign('Sustentabilidade', 'Ideias para reduzir impacto ambiental', date('Y-m-d', strtotime('+120 days')));
            $campaigns = $this->listCampaigns()['campaigns'];
        }
        $cIds = array_column($campaigns, 'id');

        // Ideas
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
            
            // Create idea manually to force status
            $ai = $this->computeAI($idea[0], $idea[1], $cid);
            $stmt = $this->db->prepare('INSERT INTO ideas(title, description, campaign_id, author_id, status, score_ai, compat_ai, created_at) VALUES(?,?,?,?,?,?,?,?)');
            $created = date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'));
            $stmt->execute([$idea[0], $idea[1], $cid, $uid, $idea[2], $ai['score'], $ai['compat'], $created]);
            $ideaId = $this->db->lastInsertId();

            // Votes
            $numVotes = rand(0, 5);
            for ($v = 0; $v < $numVotes; $v++) {
                $voterId = $userIds[rand(0, count($userIds) - 1)];
                try {
                    $this->db->prepare('INSERT INTO idea_votes(idea_id, user_id) VALUES(?,?)')->execute([$ideaId, $voterId]);
                } catch (\Throwable $e) {}
            }

            // Comments
            if (rand(0, 1)) {
                $commenterId = $userIds[rand(0, count($userIds) - 1)];
                $this->db->prepare('INSERT INTO idea_comments(idea_id, user_id, text) VALUES(?,?,?)')->execute([$ideaId, $commenterId, 'Ótima ideia! Apoio totalmente.']);
            }
        }

        return ['ok' => true, 'message' => 'banco_populado_com_sucesso'];
    }
}
