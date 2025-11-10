<?php

namespace App\Services;

use Google\Client As GoogleClient;
use Google\Service\Drive As GoogleDrive;
use Google\Service\Drive\Permission;

class GoogleFileUpload
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new GoogleClient();
        $this->client->setClientId(config('filesystems.disks.google.clientId'));
        $this->client->setClientSecret(config('filesystems.disks.google.clientSecret'));
        $this->client->refreshToken(config('filesystems.disks.google.refreshToken'));
        $this->service = new GoogleDrive($this->client);
    }

    public function getAccessToken(){
        $token = $this->client->getAccessToken();

        if ($this->client->isAccessTokenExpired()) {
            $token = $this->fetchAccessTokenWithRefreshToken(config('filesystems.disks.google.refreshToken'));
        }
        return $token['access_token'];
    }
    
    public function makeFileToPublic($driveFileId)
    {
       $permission = new Permission([
        'type' => 'anyone',
        'role' => 'reader',
       ]);

         $this->service->permissions->create($driveFileId, $permission);
    }
}

