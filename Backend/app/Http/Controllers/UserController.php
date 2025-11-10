<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Services\GoogleFileUpload;
use Yaza\LaravelGoogleDriveStorage\Gdrive;
use Illuminate\Support\Facades\File;
class UserController extends Controller
{
    public function __construct(public GoogleFileUpload $googlefileupload){}

    public function index()
    {
        $users = User::where('id', '!=', Auth::id())->get();
        return response()->json($users);
    }

    public function status()
    {
        $users = User::where('id', '!=', Auth::id())
            ->select(['id', 'name', 'last_seen_at'])
            ->get()
            ->map(function ($user) {
                $user->is_online = $user->last_seen_at && $user->last_seen_at->diffInMinutes(now()) < 5;
                return $user;
            });

        return response()->json($users);
    }

    public function updateProfile(Request $request)
    {
        config(['filesystems.disks.google.accessToken' => $this->googlefileupload->getAccessToken()]);

        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        $user = Auth::user();
    if ($request->hasFile('file')) {
            $file = $request->file('file');

            $filename = $file->getClientOriginalName();
            Gdrive::put($filename, $file);
            $contents = Gdrive::all('/');
            $uploadContent = $contents->firstWhere('path', $filename);
            if (!$uploadContent) {
                return response()->json(['error' => 'Failed to find uploaded file on Google Drive'], 500);
            }
            $fileMeta = $uploadContent->extraMetadata() ?? [];
            $driveFileId = $fileMeta['id'] ?? null;
            if (!$driveFileId) {
                return response()->json(['error' => 'Cannot get Google Drive file ID'], 500);
            }
            $this->googlefileupload->makeFileToPublic($driveFileId);
            $user->avatar = $driveFileId;
        }

        $user->update($request->only(['name']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'avatar' => $driveFileId ?? null
        ]);
     }
    }