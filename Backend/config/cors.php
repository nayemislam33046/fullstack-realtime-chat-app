<?php

return [

    'paths' => [ 'api/*', 
    'storage/*',
        'sanctum/csrf-cookie', 
        'login', 
        'logout', 
        'register',
        'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['https://chat-app-frontend-six-red.vercel.app'], 
    
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];