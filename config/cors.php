<?php

return [
    'paths'                 => ['api/*', 'sanctum/csrf-cookie'],
    'allow_methods'         => ['*'],
    'allow_origins'         => [
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    'allowed_origins_patterns'  => [],
    'allowed_headers'           => ['*'],
    'exposed_headers'           => [],
    'max_age'                   => 0,
    'support_credentials'       => false,
];