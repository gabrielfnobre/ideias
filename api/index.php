<?php
declare(strict_types=1);

/**
 * ===============================================================
 * API CENTRAL (index.php) – SUA ENTRADA ÚNICA PARA TUDO NA API 🚦
 * 
 * COMO FUNCIONA? Leia isso antes de mexer:
 * ---------------------------------------------------------------
 * 1. Todo request HTTP feito para /api/index.php passa por aqui.
 * 2. Aqui mapeamos as ROTAS da API, por área (autenticação, campanhas, ideias etc).
 * 3. Cada rota verifica:
 *    - Qual método HTTP foi usado (GET, POST...).
 *    - Qual caminho foi informado na query (?route=xxx).
 *    - Se for necessário, lê o corpo JSON enviado.
 *    - Chama o método correspondente no "Kernel", que contém toda a lógica de negócio/backend.
 *    - Retorna a resposta em formato JSON padrão, com o status e demais headers adequados.
 * ---------------------------------------------------------------
 * 
 * 📚 COMO ADICIONAR/MODIFICAR:
 * - Quer criar um novo endpoint? Registre e documente a rota aqui.
 * - Veja exemplos de cada área abaixo, com explicações.
 * - Toda vez que alterar rotas, explique o que aceita e retorna (entrada/saída, autenticação, exceções).
 * - Se errar na rota/método, vai cair no 404 no final.
 *
 * SE DER ERRO/EXCEÇÃO: retorna HTTP 500 + JSON com a mensagem do erro.
 * SE NÃO ENCONTRAR ROTA: retorna HTTP 404 + JSON padrão.
 * 
 * ÁREAS DE ROTA:
 * - AUTENTICAÇÃO E USUÁRIO
 * - CAMPANHAS
 * - IDEIAS (CRUD, VOTAÇÃO, COMENTÁRIOS)
 * - BADGES & GAMIFICAÇÃO
 * - ADMINISTRAÇÃO E OUTROS
 * 
 * ---------------------------------------------------------------
 * Para entender qualquer endpoint, basta ver a documentação da rota
 * correspondente abaixo. NÃO DEIXE DE DOCUMENTAR!
 * ===============================================================
 */

// Carrega o núcleo da aplicação
require __DIR__ . '/kernel.php';
use Ideias\Kernel;

// Instancia o núcleo principal do sistema (Kernel)
// Centraliza toda a lógica de negócio/backend
$k = new Kernel();
$k_aplicacao_db = Kernel::withCustomConnection('localhost', '3306', 'root', '', 'users_db');

// Descobre qual rota e método HTTP estão sendo pedidos
$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Sempre retorna JSON para o cliente/fetch
header('Content-Type: application/json; charset=utf-8');

/**
 * =====================================
 * AUTENTICAÇÃO E USUÁRIO
 * =====================================
 *
 * ENDPOINTS DISPONÍVEIS (autenticação):
 * 
 * [POST]  route=auth/signup     Cadastro de novo usuário
 *         Parâmetros: {email, password, name}
 *         Retorno: {ok: true/false, ...}
 * 
 * [POST]  route=auth/login      Login com email e senha
 *         Parâmetros: {email, password}
 *         Retorno: {ok, token/session, ...}
 * 
 * [POST]  route=auth/google     Login via Google OAuth
 *         Parâmetros: {id_token}
 *         Retorno: {ok, ...}
 * 
 * [POST]  route=auth/logout     Encerra a sessão
 *         Parâmetros: nenhum
 *         Retorno: {ok: true}
 * 
 * [GET]   route=auth/verify     Confirma email do usuário
 *         Parâmetros: uid, token (na URL)
 *         Retorno: {ok, ...}
 * 
 * [POST]  route=auth/request-reset     Solicita redefinição de senha
 *         Parâmetros: {email}
 *         Retorno: {ok, ...}
 * 
 * [POST]  route=auth/reset     Finaliza redefinição de senha
 *         Parâmetros: {uid, token, password}
 *         Retorno: {ok, ...}
 */

// Cadastro de novo usuário
if ($route === 'auth/signup' && $method === 'POST') {
    // Recebe os dados enviados pelo POST em JSON
    // Esta linha lê os dados brutos enviados no corpo da requisição HTTP (geralmente em JSON), 
    // faz o decode desse JSON para um array associativo do PHP e, caso a decodificação falhe, retorna um array vazio.
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    $name = trim((string)($data['name'] ?? ''));
    $res = $k->signup($email, $password, $name); // método backend
    echo json_encode($res);
    exit;
}

// Login tradicional (email/senha)
if ($route === 'auth/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    $res = $k->login($email, $password);
    echo json_encode($res);
    exit;
}

// Login com Google OAuth (token JWT Google)
if ($route === 'auth/google' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $token = (string)($data['id_token'] ?? '');
    $res = $k->loginWithGoogle($token);
    echo json_encode($res);
    exit;
}

// Logout tradicional (encerra a sessão do usuário)
if ($route === 'auth/logout' && $method === 'POST') {
    $k->logout();
    echo json_encode(['ok' => true]);
    exit;
}

// Confirmação de email (via link enviado por email)
if ($route === 'auth/verify' && $method === 'GET') {
    $uid = (int)($_GET['uid'] ?? 0);
    $token = (string)($_GET['token'] ?? '');
    $res = $k->verifyEmail($uid, $token);
    echo json_encode($res);
    exit;
}

// Solicitação de redefinição de senha (envia email de reset)
if ($route === 'auth/request-reset' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $res = $k->requestPasswordReset($email);
    echo json_encode($res);
    exit;
}

// Finaliza redefinição de senha (link + nova senha)
if ($route === 'auth/reset' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $uid = (int)($data['uid'] ?? 0);
    $token = (string)($data['token'] ?? '');
    $password = (string)($data['password'] ?? '');
    $res = $k->resetPassword($uid, $token, $password);
    echo json_encode($res);
    exit;
}


/**
 * =====================================
 * CAMPANHAS – GERENCIAMENTO DE CAMPANHAS
 * =====================================
 *
 * ENDPOINTS DISPONÍVEIS:
 * 
 * [GET]   route=campaigns/list         Lista todas as campanhas existentes
 *          Parâmetros: nenhum
 *          Retorno: [{id, title, description, deadline, ...}, ...]
 * 
 * [POST]  route=campaigns/create       Cria uma nova campanha
 *          Parâmetros: {title, description, deadline?}
 *          Retorno: {ok, campaign, ...}
 */

// Listar campanhas
if ($route === 'campaigns/list' && $method === 'GET') {
    try {
        echo json_encode($k->listCampaigns());
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'ok'=>false,
            'error'=>'excecao',
            'message'=>$e->getMessage()
        ]);
    }
    exit;
}

// Criar nova campanha
if ($route === 'campaigns/create' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $deadline = (string)($data['deadline'] ?? '');
    echo json_encode($k->createCampaign($title, $description, $deadline ?: null));
    exit;
}


/**
 * =====================================
 * IDEIAS (CRUD, VOTAÇÃO, COMENTÁRIOS)
 * =====================================
 *
 * ENDPOINTS DISPONÍVEIS:
 *
 * [POST]  route=ideas/create           Cria uma ideia
 *          Parâmetros: {title, description, campaign_id?}
 *          Retorno: {ok, idea, ...}
 *
 * [GET]   route=ideas/list             Lista ideias, filtros opcionais
 *          Parâmetros: campaign_id, status, q (query string)
 *          Retorno: [ {id, title, votes, ...}, ... ]
 *
 * [GET]   route=ideas/get              Busca detalhes de uma ideia
 *          Parâmetros: id
 *          Retorno: {id, title, description, status, ...}
 *
 * [POST]  route=ideas/vote             Vota em uma ideia (apenas upvote)
 *          Parâmetros: {id}
 *          Retorno: {ok, votes, ...}
 *
 * [POST]  route=ideas/comment          Comenta/responde em uma ideia
 *          Parâmetros: {id, text, parent_id?}
 *          Retorno: {ok, idea, ...}
 *
 * [POST]  route=ideas/update_status    Atualiza status da ideia
 *          Parâmetros: {id, status}
 *          Retorno: {ok, ...}
 *
 * [POST]  route=ideas/update           Atualiza ideia (apenas autor/admin)
 *          Parâmetros: campos da ideia para atualizar
 *          Retorno: {ok, ...}
 */

// Criação de nova ideia
if ($route === 'ideas/create' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $campaignId = isset($data['campaign_id']) ? (int)$data['campaign_id'] : null;
    echo json_encode($k->createIdea($title, $description, $campaignId));
    exit;
}

// Lista ideias filtradas por campanha/status/query (GET)
if ($route === 'ideas/list' && $method === 'GET') {
    try {
        $campaignId = isset($_GET['campaign_id']) ? (int)$_GET['campaign_id'] : null;
        $status = isset($_GET['status']) ? (string)$_GET['status'] : null;
        $q = isset($_GET['q']) ? (string)$_GET['q'] : null;
        echo json_encode($k->listIdeas($campaignId, $status, $q));
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'ok'=>false,
            'error'=>'excecao',
            'message'=>$e->getMessage()
        ]);
    }
    exit;
}

// Busca detalhes completos de uma ideia específica
if ($route === 'ideas/get' && $method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    echo json_encode($k->getIdea($id));
    exit;
}

// Vota em uma ideia (apenas positivo/"upvote")
if ($route === 'ideas/vote' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    echo json_encode($k->voteIdea($id));
    exit;
}

// Conta a quantidade de votos de uma ideia específica (POST)
if ($route === 'ideas/count_votes' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    echo json_encode($k->countVotesForIdea($id));
    exit;
}

// Faz um comentário (ou resposta) em uma ideia específica
// parent_id é opcional (use para reply em comentário existente)
if ($route === 'ideas/comment' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    $text = (string)($data['text'] ?? '');
    $parent = isset($data['parent_id']) ? (int)$data['parent_id'] : null;
    echo json_encode($k->commentIdea($id, $text, $parent));
    exit;
}

// Retorna todos os textos dos comentários de uma ideia específica usando POST
if ($route === 'ideas/list_comments' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    $comments = $k->listCommentsTextsByIdea($id);
    // Retorna um JSON-Object "direto" no padrão { user_id1: texto1, user_id2: texto2 }
    header('Content-Type: application/json');
    echo json_encode($comments, JSON_FORCE_OBJECT);
    exit;
}

// Nova condicional: retorna os dados de um usuário via id usando getUserById do kernel
if ($route === 'user/get' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $uid = (int)($data['id'] ?? 0);
    $user = $k->getUserById($uid);
    header('Content-Type: application/json');
    echo json_encode($user ?? []);
    exit;
}



// Atualiza apenas o status da ideia (ex: aprovado, andamento, etc)
if ($route === 'ideas/update_status' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    $status = (string)($data['status'] ?? '');
    echo json_encode($k->updateIdeaStatus($id, $status));
    exit;
}

// Atualiza fields da ideia inteira (apenas autor original ou admin pode)
if ($route === 'ideas/update' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    echo json_encode($k->updateIdea($data));
    exit;
}

/**
 * =====================================
 * BADGES & GAMIFICAÇÃO
 * =====================================
 *
 * ENDPOINTS:
 *
 * [GET]   route=badges/list        Lista badges do usuário logado
 *          Parâmetros: nenhum (auth necessária)
 *          Retorno: [ {id, name, ...}, ... ]
 *
 * [GET]   route=stats/leaderboard  Exibe ranking de usuários
 *          Parâmetros: nenhum
 *          Retorno: [ {user, pontos, ...}, ... ]
 *
 * [GET]   route=stats/dashboard    KPIs/dados de admin (apenas staff/admins)
 *          Parâmetros: nenhum
 *          Retorno: { ... }
 */

// Lista de badges do usuário autenticado/logado
if ($route === 'badges/list' && $method === 'GET') {
    $uid = (int)($_SESSION['uid'] ?? 0);
    if (!$uid) {
        echo json_encode(['ok'=>false,'error'=>'nao_autenticado']);
        exit;
    }
    echo json_encode($k->listBadgesForUser($uid));
    exit;
}

// Ranking dos usuários (leaderboard)
if ($route === 'stats/leaderboard' && $method === 'GET') {
    echo json_encode($k->leaderboard());
    exit;
}

// KPIs/Estatísticas administrativas/dashboards
if ($route === 'stats/dashboard' && $method === 'GET') {
    echo json_encode($k->dashboardStats());
    exit;
}

/**
 * =====================================
 * ADMINISTRAÇÃO E OUTROS
 * =====================================
 *
 * ENDPOINTS:
 *
 * [GET]  route=admin/seed         Roda Seed inicial de dados (admin)
 *        Parâmetros: nenhum
 *        Retorno: { ok, seed, ... }
 */

// Cria dados de seed iniciais no banco (apenas admins)
if ($route === 'admin/seed' && $method === 'GET') {
    echo json_encode($k->seedDatabase());
    exit;
}

/**
 * ======================================
 * ROTAS NÃO ENCONTRADAS – ERRO 404
 * ======================================
 * 
 * Nenhuma rota acima bateu.
 * Retorna um erro claro ao cliente!
 */
http_response_code(404);
echo json_encode([
    'ok' => false,
    'error' => 'rota_nao_encontrada',
    'message' => 'Nenhum endpoint correspondeu à requisição. Verifique o route e o método HTTP.'
]);

/**
 * ======================================
 * ROTAS NÃO ENCONTRADAS – ERRO 404
 * ======================================
 * 
 * Nenhuma rota acima bateu.
 * Retorna um erro claro ao cliente!
 */
// Login tradicional (email/senha)
if ($route === 'user/photo' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $register = trim((string)($data['register'] ?? ''));
    $res = $k_aplicacao_db->getPhoto($register);
    echo json_encode($res);
    exit;
}
