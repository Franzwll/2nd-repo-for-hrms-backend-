<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$request = \Illuminate\Http\Request::create('/api/v1/applicants', 'GET');
$request->headers->set('Authorization', 'Bearer 27|nsVAyAlENGUlnlSz01lSva28RQ2S533e8sbyqbmw38d48854');
$request->headers->set('Accept', 'application/json');
$response = $app->handle($request);
echo $response->getContent();