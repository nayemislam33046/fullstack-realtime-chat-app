<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\MessageStatusUpdated;
use App\Events\TypingStatus;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Intervention\Image\Laravel\Facades\Image;
use Yaza\LaravelGoogleDriveStorage\Gdrive;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use App\Services\GoogleFileUpload;

class MessageController extends Controller
    {
        use AuthorizesRequests;

        public function __construct(public GoogleFileUpload $googlefileupload){}

        /**
         * Display messages for a conversation.
         */

        public function index(Conversation $conversation)
        {
            config(['filesystems.disks.google.accessToken'=>$this->googlefileupload->getAccessToken()]);
            $this->authorize('view', $conversation);

            $messages = $conversation->messages()
                ->with(['user', 'statuses'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($messages);
        }

        /**
         * Store a new message in a conversation.
         */

        public function store(Request $request, Conversation $conversation)
        {
            config(['filesystems.disks.google.accessToken' => $this->googlefileupload->getAccessToken()]);
            $this->authorize('view', $conversation);

            // Validation
            $request->validate([
                'body' => 'required_without:file|string|nullable',
                'file' => 'required_without:body|file|max:10240|nullable',
            ]);

            $user = Auth::user();
            $data = [];
            $type = $request->hasFile('file') ? 'file' : 'text';

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = $file->getClientOriginalName();

                // Upload to Google Drive
                Gdrive::put($filename, $file);

                // Retrieve uploaded file info
                $contents = Gdrive::all('/');
                $uploadContent = $contents->firstWhere('path', $filename);

                if (!$uploadContent) {
                    return back()->withErrors(['file' => 'Failed to find uploaded file on Google Drive']);
                }

                $fileMeta = $uploadContent->extraMetadata() ?? [];
                $driveFileId = $fileMeta['id'] ?? null;
                $name = $fileMeta['name'] ?? $filename;
                $extension = $fileMeta['extension'] ?? $file->getClientOriginalExtension();

                if (!$driveFileId) {
                    return back()->withErrors(['file' => 'Cannot get Google Drive file ID']);
                }
                $this->googlefileupload->makeFileToPublic($driveFileId);
                $data = [
                    'drive_file_id' => $driveFileId,
                    'name' => $name,
                    'filename' => $filename,
                    'extension' => $extension,
                    'path' => $uploadContent->path(),
                    'mimeType' => $uploadContent->mimeType(),
                    'fileSize' => $uploadContent->fileSize(),
                    'visibility' => $uploadContent->visibility(),
                    'lastModified' => Carbon::createFromTimestamp(
                        $uploadContent->lastModified()
                    )->setTimezone('Asia/Dhaka'),
                ];
            }
            // Create message
            $message = $conversation->messages()->create([
                'user_id' => $user->id,
                'body'    => $request->body ?? '',
                'type'    => $type,
                'data'    => $data,
            ]);

            // message statuses for other participants
            $participants = $conversation->participants()
                ->where('user_id', '!=', $user->id)
                ->get();

            foreach ($participants as $participant) {
                MessageStatus::create([
                    'message_id' => $message->id,
                    'user_id'    => $participant->user_id,
                    'is_seen'    => false,
                ]);
            }

            // Load relationships for response
            $message->load('user', 'statuses');

            // Broadcast message to others
            broadcast(new MessageSent($message))->toOthers();

            return response()->json($message, 201);
        }

        /**
         * Update message content.
         */
        public function update(Request $request, Message $message)
        {
            $this->authorize('update', $message);

            $request->validate([
                'body' => 'required|string',
            ]);

            $message->update([
                'body' => $request->body,
            ]);

            broadcast(new MessageSent($message))->toOthers();

            return response()->json($message);
        }

        /**
         * Delete a message and its associated files.
         */
        public function destroy(Message $message)
        {

            config(['filesystems.disks.google.accessToken'=>$this->googlefileupload->getAccessToken()]);

            $this->authorize('delete', $message);

            if (isset($message->data['path'])) {
                Gdrive::delete($message->data['path']);
            }

            // Delete message record
            $message->delete();
            return response()->json(['message' => 'Message deleted']);
        }

        /**
         * Download a file associated with a message.
         */
        public function downloadFile(Message $message)
            {
                config(['filesystems.disks.google.accessToken' => $this->googlefileupload->getAccessToken()]);
                $data = $message->data;

                if (!isset($data['path'])) {
                    return response()->json(['error' => 'No file path found'], 404);
                }

                $fileData = Gdrive::get($data['path']);

                // Ensure filename and extension are set
                $fileName = $data['filename'] ?? 'downloaded_file';
                $mimeType = $data['mimeType'] ?? 'application/octet-stream';

                // Extract extension from mimeType if missing
                if (!str_contains($fileName, '.')) {
                    $ext = explode('/', $mimeType)[1] ?? 'bin';
                    $fileName .= '.' . $ext;
                }

                return response($fileData->file, 200, [
                    'Content-Type' => $mimeType,
                    'Content-Disposition' => 'attachment; filename="' . basename($fileName) . '"',
                    'Cache-Control' => 'no-cache, must-revalidate',
                    'Pragma' => 'no-cache',
                ]);
            }

        /**
         * Mark a message as seen by the authenticated user.
         */
        public function markAsSeen(Message $message)
        {
            $user = Auth::user();
            $status = $message->statuses()
                ->where('user_id', $user->id)
                ->first();
            if ($status && !$status->is_seen) {
                $status->update([
                    'is_seen' => true,
                    'seen_at' => now(),
                ]);
                $message->load('statuses');
                broadcast(new MessageStatusUpdated($status))->toOthers();
            }
            return response()->json($message);
        }

        /**
         * Handle typing status event.
         */
        public function typing(Request $request)
        {
            $request->validate([
                'conversation_id' => 'required|exists:conversations,id',
                'is_typing' => 'required|boolean',
            ]);
            $user = Auth::user();
            broadcast(new TypingStatus(
                $user->id,
                $request->conversation_id,
                $request->is_typing
            ))->toOthers();
            return response()->json(['message' => 'Typing status updated']);
        }

        /**
         * Determine file type based on MIME type.
         */
        private function getFileType($file)
        {
            $mime = $file->getClientMimeType();

            if (Str::startsWith($mime, 'image/')) {
                return 'image';
            } elseif (Str::startsWith($mime, 'video/')) {
                return 'video';
            } elseif (Str::startsWith($mime, 'audio/')) {
                return 'audio';
            } elseif ($mime === 'application/pdf') {
                return 'pdf';
            }
            return 'file';
        }

        /**
         * Create a thumbnail for image messages.
         */
        private function createThumbnail($file)
        {
            $image = Image::read($file);
            $image->scaleDown(width: 300);
            $thumbnailPath = 'message_files/thumbnails/' . uniqid() . '.jpg';
            Storage::put($thumbnailPath, (string) $image->toJpeg(80));
            return $thumbnailPath;
        }
    }
