<?php
// Minimal JWT encode/decode (HS256)

function base64url_encode(string $data): string { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
function base64url_decode(string $data): string { return base64_decode(strtr($data, '-_', '+/')); }

function jwt_sign(array $payload): string {
    $config = require __DIR__ . '/config.php';
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now = time();
    $payload = array_merge($payload, [
        'iss' => $config['jwt']['issuer'],
        'aud' => $config['jwt']['audience'],
        'iat' => $now,
        'exp' => $now + $config['jwt']['ttl_seconds']
    ]);
    $segments = [base64url_encode(json_encode($header)), base64url_encode(json_encode($payload))];
    $signing_input = implode('.', $segments);
    $sig = hash_hmac('sha256', $signing_input, $config['jwt']['secret'], true);
    $segments[] = base64url_encode($sig);
    return implode('.', $segments);
}

function jwt_verify(string $token): ?array {
    $config = require __DIR__ . '/config.php';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $calc = base64url_encode(hash_hmac('sha256', "$h.$p", $config['jwt']['secret'], true));
    if (!hash_equals($calc, $s)) return null;
    $payload = json_decode(base64url_decode($p), true);
    if (!$payload) return null;
    $now = time();
    if (($payload['exp'] ?? 0) < $now) return null;
    if (($payload['iss'] ?? '') !== $config['jwt']['issuer']) return null;
    if (($payload['aud'] ?? '') !== $config['jwt']['audience']) return null;
    return $payload;
}

function require_jwt_role(array $roles){
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) respond_json(['error' => 'Unauthorized'], 401);
    $payload = jwt_verify($m[1]);
    if (!$payload) respond_json(['error' => 'Unauthorized'], 401);
    $role = $payload['role'] ?? 'customer';
    if (!in_array($role, $roles, true)) respond_json(['error' => 'Forbidden'], 403);
    return $payload; // includes sub (user id)
}


