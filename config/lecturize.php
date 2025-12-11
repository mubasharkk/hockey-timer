<?php

return [
    'addresses' => [
        'table' => 'addresses',
        'flags' => ['public', 'primary', 'billing', 'shipping'],
        'geocode' => false,
    ],
    'contacts' => [
        'table' => 'contacts',
        'flags' => ['public', 'primary'],
    ],
];
