<?php
// Basic configuration for DB connection

return [
    'db' => [
        'host' => getenv('NEOSHOP_DB_HOST') ?: '127.0.0.1',
        'port' => (int)(getenv('NEOSHOP_DB_PORT') ?: 3306),
        'name' => getenv('NEOSHOP_DB_NAME') ?: 'migrations',
        'user' => getenv('NEOSHOP_DB_USER') ?: 'root',
        'pass' => getenv('NEOSHOP_DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    'cors' => [
        'allow_origin' => getenv('NEOSHOP_CORS_ORIGIN') ?: '*',
    ],
    'jwt' => [
        'secret' => getenv('NEOSHOP_JWT_SECRET') ?: 'change_this_dev_secret',
        'issuer' => getenv('NEOSHOP_JWT_ISS') ?: 'neoshop.local',
        'audience' => getenv('NEOSHOP_JWT_AUD') ?: 'neoshop.web',
        'ttl_seconds' => (int)(getenv('NEOSHOP_JWT_TTL') ?: 3600)
    ],
];


