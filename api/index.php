<?php
declare(strict_types=1);

require __DIR__ . '/kernel.php';

use Ideias\Kernel;

$k = new Kernel();
$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
header('Content-Type: application/json; charset=utf-8');

if ($route === 'auth/signup' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    $name = trim((string)($data['name'] ?? ''));
    $res = $k->signup($email, $password, $name);
    echo json_encode($res);
    exit;
}

if ($route === 'auth/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    $res = $k->login($email, $password);
    echo json_encode($res);
    exit;
}

if ($route === 'auth/google' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $token = (string)($data['id_token'] ?? '');
    $res = $k->loginWithGoogle($token);
    echo json_encode($res);
    exit;
}

if ($route === 'auth/logout' && $method === 'POST') {
    $k->logout();
    echo json_encode(['ok' => true]);
    exit;
}

if ($route === 'auth/verify' && $method === 'GET') {
    $uid = (int)($_GET['uid'] ?? 0);
    $token = (string)($_GET['token'] ?? '');
    $res = $k->verifyEmail($uid, $token);
    echo json_encode($res);
    exit;
}

if ($route === 'auth/request-reset' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim((string)($data['email'] ?? ''));
    $res = $k->requestPasswordReset($email);
    echo json_encode($res);
    exit;
}

if ($route === 'auth/reset' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $uid = (int)($data['uid'] ?? 0);
    $token = (string)($data['token'] ?? '');
    $password = (string)($data['password'] ?? '');
    $res = $k->resetPassword($uid, $token, $password);
    echo json_encode($res);
    exit;
}

if ($route === 'campaigns/list' && $method === 'GET') {
    try { echo json_encode($k->listCampaigns()); } catch (Throwable $e) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'excecao','message'=>$e->getMessage()]); }
    exit;
}

if ($route === 'campaigns/create' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $deadline = (string)($data['deadline'] ?? '');
    echo json_encode($k->createCampaign($title, $description, $deadline ?: null));
    exit;
}

if ($route === 'ideas/create' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $title = trim((string)($data['title'] ?? ''));
    $description = trim((string)($data['description'] ?? ''));
    $campaignId = isset($data['campaign_id']) ? (int)$data['campaign_id'] : null;
    echo json_encode($k->createIdea($title, $description, $campaignId));
    exit;
}

if ($route === 'ideas/list' && $method === 'GET') {
    try {
        $campaignId = isset($_GET['campaign_id']) ? (int)$_GET['campaign_id'] : null;
        $status = isset($_GET['status']) ? (string)$_GET['status'] : null;
        $q = isset($_GET['q']) ? (string)$_GET['q'] : null;
        echo json_encode($k->listIdeas($campaignId, $status, $q));
    } catch (Throwable $e) { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'excecao','message'=>$e->getMessage()]); }
    exit;
}

if ($route === 'ideas/get' && $method === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    echo json_encode($k->getIdea($id));
    exit;
}

if ($route === 'ideas/vote' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    echo json_encode($k->voteIdea($id));
    exit;
}

if ($route === 'ideas/comment' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    $text = (string)($data['text'] ?? '');
    $parent = isset($data['parent_id']) ? (int)$data['parent_id'] : null;
    echo json_encode($k->commentIdea($id, $text, $parent));
    exit;
}

if ($route === 'badges/list' && $method === 'GET') {
    $uid = (int)($_SESSION['uid'] ?? 0);
    if (!$uid) { echo json_encode(['ok'=>false,'error'=>'nao_autenticado']); exit; }
    echo json_encode($k->listBadgesForUser($uid));
    exit;
}

if ($route === 'stats/leaderboard' && $method === 'GET') {
    echo json_encode($k->leaderboard());
    exit;
}

if ($route === 'stats/dashboard' && $method === 'GET') {
    echo json_encode($k->dashboardStats());
    exit;
}

if ($route === 'ideas/update_status' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($data['id'] ?? 0);
    $status = (string)($data['status'] ?? '');
    echo json_encode($k->updateIdeaStatus($id, $status));
    exit;
}

if ($route === 'ideas/update' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    echo json_encode($k->updateIdea($data));
    exit;
}

if ($route === 'admin/seed' && $method === 'GET') {
    echo json_encode($k->seedDatabase());
    exit;
}

http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'rota_nao_encontrada']);
